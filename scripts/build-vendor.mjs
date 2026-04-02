#!/usr/bin/env node
/**
 * scripts/build-vendor.mjs
 *
 * Builds the "engine bundle" — a single IIFE file that wraps the 8bitworkshop
 * builder, tools, and platforms and registers them on globalThis as
 * `retroCompileEngine`.  This is what the compiler Web Worker fetches and
 * executes at runtime.
 *
 * Usage (from retro-compile repo root):
 *   node scripts/build-vendor.mjs --8bws /path/to/8bitworkshop-master
 *
 * Output:
 *   dist/vendor/builder-bundle.js
 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { parseArgs } from 'util';

// ── CLI args ─────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    '8bws': { type: 'string' },
    help:   { type: 'boolean', short: 'h' },
  },
  strict: false,
});

if (values.help || !values['8bws']) {
  console.log(`
Usage: node scripts/build-vendor.mjs --8bws <path-to-8bitworkshop>

  --8bws <path>   Root of the 8bitworkshop source tree (contains package.json)
  -h, --help      Show this message
`);
  process.exit(values.help ? 0 : 1);
}

const BWS_ROOT  = resolve(values['8bws']);
const OUT_DIR   = resolve('dist/vendor');
const OUT_FILE  = join(OUT_DIR, 'builder-bundle.js');

if (!existsSync(join(BWS_ROOT, 'package.json'))) {
  console.error(`Error: ${BWS_ROOT} does not look like a 8bitworkshop root (no package.json)`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

console.log(`Building engine bundle from ${BWS_ROOT} …`);

// ── Shim file ─────────────────────────────────────────────────────────────────
// We write a tiny entry-point that imports the pieces we need from 8bws and
// registers them under the name the worker expects.

const SHIM_PATH = join(OUT_DIR, '_entry.ts');

writeFileSync(SHIM_PATH, `
// Auto-generated entry point for retro-compile vendor bundle.
// This runs inside the compiler Web Worker.

import { store, builder } from '${join(BWS_ROOT, 'src/worker/builder')}';
import { PLATFORM_PARAMS } from '${join(BWS_ROOT, 'src/worker/platforms')}';

// Register all tool handlers so builder.handleMessage() can find them.
// The import itself is enough — TOOLS is populated as a side-effect.
import '${join(BWS_ROOT, 'src/worker/workertools')}';

// Surface the three objects the worker needs.
(globalThis as any).retroCompileEngine = { store, builder, PLATFORM_PARAMS };
`);

// ── esbuild ───────────────────────────────────────────────────────────────────

await esbuild.build({
  entryPoints: [SHIM_PATH],
  bundle:      true,
  format:      'iife',       // runs via new Function(code)() in the Worker
  globalName:  '_rc',        // not actually used — we register on globalThis manually
  platform:    'browser',
  target:      ['es2020'],
  outfile:     OUT_FILE,
  sourcemap:   'inline',
  // 8bitworkshop uses Node builtins in a few places (path, fs) but those code
  // paths are only hit in the Node/server entry point, not the browser worker.
  // Mark them external so esbuild doesn't try to bundle a polyfill.
  external:    ['fs', 'path', 'node:*', 'worker_threads'],
  // Suppress the "use of eval" warning — Emscripten modules use eval internally.
  logOverride: { 'direct-eval': 'silent' },
  define: {
    // Tell 8bws code it's running in a Web Worker environment
    'typeof window':        '"undefined"',
    'typeof importScripts': '"function"',
    'ENVIRONMENT_IS_WORKER': 'true',
    'ENVIRONMENT_IS_WEB':    'false',
    'ENVIRONMENT_IS_NODE':   'false',
  },
});

// Clean up the temp shim
import { unlinkSync } from 'fs';
try { unlinkSync(SHIM_PATH); } catch {}

console.log(`✓  ${OUT_FILE} (${formatSize(readFileSync(OUT_FILE).length)})`);

function formatSize(bytes) {
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}
