#!/usr/bin/env node
/**
 * scripts/build-worker.mjs
 *
 * Produces dist/worker/worker.bundle.js — a self-contained classic worker
 * script (no ES module syntax, no import/export) that can be loaded as:
 *   new Worker('worker.bundle.js')   // no { type: 'module' } needed
 *
 * Classic workers support importScripts(), which the 8bitworkshop builder
 * bundle uses internally to load Wasm JS glue files.
 *
 * Strategy: concatenate the compiled JS from worker.ts and profiles.ts,
 * strip all import/export statements, wrap in an IIFE, and write to dist/.
 *
 * Run after `tsc`:
 *   node scripts/build-worker.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const DIST    = resolve('dist');
const OUT     = resolve('dist/worker/worker.bundle.js');

mkdirSync(resolve('dist/worker'), { recursive: true });

// ---------------------------------------------------------------------------
// Load the compiled modules we need to inline
// ---------------------------------------------------------------------------

function load(path) {
  return readFileSync(resolve(path), 'utf8')
    // Strip source maps
    .replace(/\/\/# sourceMappingURL=.*$/gm, '')
    // Strip "use strict" (we'll add one at the top)
    .replace(/^"use strict";?\s*/gm, '')
    .trim();
}

// profiles.js: strip ES module export syntax
let profilesSrc = load('dist/platforms/profiles.js')
  .replace(/^export\s+\{[^}]*\};?\s*$/gm, '')         // export { foo, bar };
  .replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ')  // export const X
  .replace(/^export\s+default\s+/gm, 'var _default = '); // export default

// worker.js: strip ES module import/export syntax
let workerSrc = load('dist/worker/worker.js')
  // Remove all import statements (types only at runtime — all erased by tsc)
  .replace(/^import\s.*?from\s+['"][^'"]+['"];?\s*$/gm, '')
  // Remove re-exports
  .replace(/^export\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm, '')
  // Strip remaining export keywords
  .replace(/^export\s+\{[^}]*\};?\s*$/gm, '')
  .replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ')
  .replace(/^export\s+default\s+/gm, 'var _default = ');

// ---------------------------------------------------------------------------
// The worker references PLATFORM_PROFILES from the profiles module.
// In the compiled worker.js it's: profiles_js_1.PLATFORM_PROFILES
// Since we're inlining profiles.js, rewrite that reference.
// ---------------------------------------------------------------------------
workerSrc = workerSrc
  .replace(/profiles_js_1\.PLATFORM_PROFILES/g, 'PLATFORM_PROFILES')
  .replace(/profiles_js_1\.getProfile/g, 'getProfile');

// ---------------------------------------------------------------------------
// Assemble the final bundle
// ---------------------------------------------------------------------------

const banner = `
// retro-compile worker bundle — classic worker (no ES module syntax)
// Built by scripts/build-worker.mjs
// Do not edit — regenerate with: node scripts/build-worker.mjs
`.trim();

const bundle = `${banner}
'use strict';

// ── Inlined: platforms/profiles.js ───────────────────────────────────────────
${profilesSrc}

// ── Worker logic: worker/worker.js ───────────────────────────────────────────
${workerSrc}
`;

writeFileSync(OUT, bundle);

const kb = (bundle.length / 1024).toFixed(0);
console.log(`✓  ${OUT} (${kb} KB)`);
