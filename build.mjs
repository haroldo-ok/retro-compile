#!/usr/bin/env node
/**
 * build.mjs — full retro-compile build
 *
 * Steps:
 *   1. Type-check TypeScript
 *   2. Build main library (ESM + CJS)
 *   3. Build Web Worker bundle (ESM)
 */

import * as esbuild from 'esbuild';
import { execSync }  from 'child_process';
import { mkdirSync } from 'fs';

mkdirSync('dist', { recursive: true });

// 1. Type-check
console.log('Type-checking...');
execSync('tsc --noEmit', { stdio: 'inherit' });
console.log('✓  Types OK');

const shared = {
  bundle:    true,
  sourcemap: true,
  target:    ['es2020', 'chrome90', 'firefox88', 'safari14'],
  platform:  'browser',
};

// 2. Main library — ESM
await esbuild.build({
  ...shared,
  entryPoints: ['src/index.ts'],
  format:  'esm',
  outfile: 'dist/index.js',
});

// 2b. Main library — CJS
await esbuild.build({
  ...shared,
  entryPoints: ['src/index.ts'],
  format:  'cjs',
  outfile: 'dist/index.cjs',
});

console.log('✓  dist/index.js + dist/index.cjs');

// 3. Worker bundle
await esbuild.build({
  ...shared,
  entryPoints: ['src/worker/worker.ts'],
  format:  'esm',
  outfile: 'dist/worker.js',
});

console.log('✓  dist/worker.js');
console.log('\nBuild complete. Run scripts/build-vendor.mjs and scripts/copy-assets.mjs to finish.');
