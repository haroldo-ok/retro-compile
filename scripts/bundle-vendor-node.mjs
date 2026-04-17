#!/usr/bin/env node
/**
 * scripts/bundle-vendor-node.mjs
 *
 * Builds dist/vendor/builder-bundle.js using only Node.js built-ins —
 * no esbuild, no webpack, no npm install required.
 *
 * Strategy: use Node's own require() resolution to load the compiled
 * CommonJS modules from gen/worker/, then re-export the three objects
 * the worker needs (store, builder, PLATFORM_PARAMS) via a small wrapper
 * that registers them as globalThis.retroCompileEngine.
 *
 * The output is a self-contained IIFE that can be fetched and run with
 * new Function(code)() inside the compiler Web Worker.
 *
 * Usage:
 *   node scripts/bundle-vendor-node.mjs --8bws /path/to/8bitworkshop
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { createRequire } from 'module';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: { '8bws': { type: 'string' }, help: { type: 'boolean', short: 'h' } },
  strict: false,
});

if (values.help || !values['8bws']) {
  console.log('Usage: node scripts/bundle-vendor-node.mjs --8bws <path-to-8bitworkshop>');
  process.exit(values.help ? 0 : 1);
}

const BWS    = resolve(values['8bws']);
const GEN    = join(BWS, 'gen/worker');
const OUTDIR = resolve('dist/vendor');
const OUT    = join(OUTDIR, 'builder-bundle.js');

if (!existsSync(join(GEN, 'builder.js'))) {
  console.error(`Error: ${GEN}/builder.js not found.`);
  console.error('Run: cd <8bws> && tsc -p src/common/tsconfig.json && tsc -p src/worker/tsconfig.json');
  process.exit(1);
}

mkdirSync(OUTDIR, { recursive: true });
console.log(`Bundling from ${GEN} …`);

// ---------------------------------------------------------------------------
// Walk the require() graph from builder.js + workertools.js + platforms.js
// and collect every local .js file in topological order.
// ---------------------------------------------------------------------------

const req = createRequire(join(GEN, '_shim.js')); // anchor for resolution
const visited  = new Set();
const ordered  = [];             // topological order
const contents = new Map();      // path → source text

// Files that reference browser-only globals or are not needed in our bundle
const SKIP_PATTERNS = [
  /verilator2js/,
  /assembler\.js$/,
  /wasiutils/,
  /server\//,
  /workermain/,    // IDE entry point — sets onmessage, not needed in our bundle
  /workerlib/,     // Node.js test shim — not needed in browser bundle
];

function shouldSkip(p) {
  return SKIP_PATTERNS.some(re => re.test(p));
}

function walk(absPath) {
  if (visited.has(absPath)) return;
  if (shouldSkip(absPath)) return;
  visited.add(absPath);

  const src = readFileSync(absPath, 'utf8');
  contents.set(absPath, src);

  // Find all require('./...') calls that refer to local files
  const re = /require\(['"](\.[^'"]+)['"]\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const dep = m[1];
    // Only follow relative requires (local modules)
    try {
      const depPath = req.resolve(join(absPath, '..', dep));
      if (depPath.startsWith(GEN) || depPath.startsWith(join(BWS, 'gen'))) {
        walk(depPath);
      }
    } catch { /* external or unresolvable — skip */ }
  }

  ordered.push(absPath);
}

// Entry points
walk(join(GEN, 'builder.js'));
walk(join(GEN, 'platforms.js'));
walk(join(GEN, 'workertools.js'));

console.log(`  ${ordered.length} modules collected`);

// ---------------------------------------------------------------------------
// Emit a single IIFE that:
//   1. Provides a minimal CommonJS shim (module/exports/require)
//   2. Inlines each module in dependency order
//   3. Registers retroCompileEngine on globalThis
// ---------------------------------------------------------------------------

// We need a require shim that can resolve the module IDs used inside the
// compiled files. Each file does: var foo = require("../common/util");
// We map those to the inline module registry by normalising the path.

function moduleId(absPath) {
  // Strip the GEN prefix and .js suffix to get a stable key
  return absPath.replace(GEN + '/', '').replace(/\.js$/, '');
}

const parts = [];

parts.push(`
(function() {
'use strict';

// ── Minimal CJS module registry ───────────────────────────────────────────
var __modules = {};
var __cache   = {};

function __define(id, factory) {
  __modules[id] = factory;
}

function __require(id) {
  // Normalise: strip leading ./ or ../gen/worker/ etc
  id = id.replace(/\\.js$/, '');
  if (__cache[id]) return __cache[id].exports;
  var mod = { exports: {} };
  __cache[id] = mod;
  var factory = __modules[id];
  if (!factory) {
    // Try stripping path components one at a time
    var parts = id.split('/');
    while (parts.length > 0) {
      var shortId = parts.join('/');
      if (__modules[shortId]) { factory = __modules[shortId]; break; }
      parts.shift();
    }
  }
  if (!factory) {
    // Return empty object for unknown modules (e.g. 'path', 'fs')
    return mod.exports;
  }
  factory(mod, mod.exports, __require);
  return mod.exports;
}

// ── Emscripten / worker globals expected by the builder code ──────────────
var _g = (typeof globalThis !== 'undefined') ? globalThis
       : (typeof self !== 'undefined')       ? self
       : (typeof global !== 'undefined')     ? global : {};

// Safe assign — self/window may be read-only in Workers
function _safeSet(key, val) {
  if (_g[key] === val) return;
  try { Object.defineProperty(_g, key, { value: val, writable: true, configurable: true }); }
  catch(e) {}
}
_safeSet('window', _g);
_safeSet('self',   _g);
if (!_g['location']) _safeSet('location', { href: './' });
_g['exports'] = _g['exports'] || {};

`);

// Emit each module wrapped in __define(id, factory)
for (const absPath of ordered) {
  const id  = moduleId(absPath);
  let src = contents.get(absPath);

  // Special rewrite for wasmutils: export fsBlob so syncFs can write into it
  // from outside the module closure. Without this, setupFS reads the private
  // local `var fsBlob = {}` which our syncFs can never reach.
  if (id === 'wasmutils') {
    // Change `var fsBlob = {};` to `var fsBlob = exports.fsBlob = {};`
    src = src.replace(
      /^(var fsBlob\s*=\s*)\{\}/m,
      '$1exports.fsBlob = {}'
    );
  }

  // Rewrite require() calls to use our shim.
  const rewritten = src
    // Remove source map references
    .replace(/\/\/# sourceMappingURL=.*/g, '')
    // Replace require("./foo") → __require("foo") using our id scheme
    .replace(/\brequire\(['"](\.[^'"]+)['"]\)/g, (_, dep) => {
      try {
        const depAbs = req.resolve(join(absPath, '..', dep));
        return `__require("${moduleId(depAbs)}")`;
      } catch {
        return `__require("${dep}")`;
      }
    })
    // Replace require("node:...") and require("fs") etc with __require(...)
    .replace(/\brequire\(['"]([^'"]+)['"]\)/g, `__require("$1")`);

  parts.push(`
// ── ${id} ──────────────────────────────────────────────────────────────────
__define("${id}", function(module, exports, __require) {
${rewritten}
});
`);
}

// Boot: require the three entry points and expose retroCompileEngine
parts.push(`
// ── Bootstrap ─────────────────────────────────────────────────────────────
var _builder   = __require("builder");
var _platforms = __require("platforms");
/* workertools registers tools as a side-effect */
__require("workertools");

_g['retroCompileEngine'] = {
  store:           _builder.store,
  builder:         _builder.builder,
  PLATFORM_PARAMS: _platforms.PLATFORM_PARAMS,
  configure: function(opts) {
    var base    = opts.baseUrl    || './';
    var libBase = base + 'lib/';

    // Override PWORKER so loadNative()/loadWASM() fetch from our hosted assets.
    // PWORKER is used as a prefix for both importScripts and XHR calls.
    _builder.PWORKER = base;

    // Also patch it on the wasmutils module's exported reference
    var wu = __require("wasmutils");
    // wasmutils reads PWORKER from builder at call time via builder_1.PWORKER,
    // so patching _builder is sufficient. But guard anyway:
    if (wu && 'PWORKER' in wu) wu.PWORKER = base;

    // Shim importScripts to fetch-and-eval synchronously when called from
    // inside new Function() (the vendor bundle context).
    // In a classic worker importScripts() IS available, so this is only
    // needed as a fallback / path-rewrite layer.
    var origImportScripts = _g['importScripts'];
    _g['importScripts'] = function(url) {
      // Rewrite relative paths that originate inside 8bws source tree
      // e.g. "../../src/worker/wasm/sdcc.js" → base + "wasm/sdcc.js"
      var m = url.match(/(?:wasm|asmjs)\\/([^/]+\\.js)$/);
      if (m) {
        var dir = url.indexOf('/asmjs/') >= 0 ? 'asmjs/' : 'wasm/';
        url = base + dir + m[1];
      }
      if (origImportScripts) {
        origImportScripts.call(_g, url);
      } else {
        // Fallback: synchronous XHR + eval (for non-worker contexts)
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        if (xhr.status === 200) new Function(xhr.responseText)();
        else throw new Error('importScripts failed: ' + url + ' (' + xhr.status + ')');
      }
    };

    _installXhrInterceptor(libBase);
  },
  syncFs: function(meta, blob) {
    var wu = __require("wasmutils");
    if (!wu) return;
    if (wu.fsMeta) Object.assign(wu.fsMeta, meta);
    // fsBlob is module-private — write through the exported reference we added
    if (wu.fsBlob) Object.assign(wu.fsBlob, blob);
  },
};

// XHR interceptor — rewrites 8bws-internal lib/ paths to our hosted assets
function _installXhrInterceptor(libBase) {
  var OrigXHR = _g['XMLHttpRequest'];
  if (!OrigXHR || OrigXHR.__rc_patched) return;
  function PatchedXHR() {
    var inner = new OrigXHR();
    return new Proxy(inner, {
      get: function(_, prop) {
        if (prop === 'open') {
          return function(method, url, async) {
            var m = url.match(/(?:src\\/worker\\/)?lib\\/(.+)$/);
            if (m) url = libBase + m[1];
            return inner.open.call(inner, method, url, async);
          };
        }
        var v = inner[prop];
        return typeof v === 'function' ? v.bind(inner) : v;
      },
      set: function(_, prop, val) { inner[prop] = val; return true; },
    });
  }
  PatchedXHR.__rc_patched = true;
  _g['XMLHttpRequest'] = PatchedXHR;
}

})();
`);

const bundle = parts.join('\n');
writeFileSync(OUT, bundle);

const kb = (bundle.length / 1024).toFixed(0);
console.log(`✓  ${OUT} (${kb} KB, ${ordered.length} modules)`);
