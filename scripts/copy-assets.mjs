#!/usr/bin/env node
/**
 * scripts/copy-assets.mjs
 *
 * Copies the Wasm binaries and Emscripten filesystem packs from a built
 * 8bitworkshop source tree into dist/assets/ so they can be served alongside
 * the retro-compile library.
 *
 * Usage:
 *   node scripts/copy-assets.mjs --8bws /path/to/8bitworkshop-master
 *
 * What gets copied:
 *   wasm/  — .wasm + JS glue files for each compiler/assembler/linker
 *   fs/    — .data + .js + .js.metadata for each Emscripten filesystem pack
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { resolve, join, basename } from 'path';
import { parseArgs } from 'util';

// ── CLI ───────────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    '8bws': { type: 'string' },
    help:   { type: 'boolean', short: 'h' },
  },
  strict: false,
});

if (values.help || !values['8bws']) {
  console.log(`
Usage: node scripts/copy-assets.mjs --8bws <path-to-8bitworkshop>
`);
  process.exit(values.help ? 0 : 1);
}

const BWS_ROOT   = resolve(values['8bws']);
const ASSETS_DIR = resolve('dist/assets');

// ── Wasm modules we need ─────────────────────────────────────────────────────
// One entry per tool: { wasm: 'name', js: 'name' }
// The JS glue file is the asm.js fallback / Emscripten wrapper.
// 8bitworkshop may ship them under wasm/ (newer) or asmjs/ (older).

const WASM_MODULES = [
  // Z80 toolchain (SDCC)
  'sdcc',
  'sdasz80',
  'sdasgb',
  'sdldz80',
  // C preprocessor (shared by all C-to-asm toolchains)
  'mcpp',
  // 6502 toolchain (CC65)
  'cc65',
  'ca65',
  'ld65',
  // 6809 toolchain (CMOC + LWASM + LWLINK)
  'cmoc',
  'lwasm',
  'lwlink',
  // 6809 assembler (for Vectrex direct-asm)
  'xasm6809',
];

// ── Filesystem packs ──────────────────────────────────────────────────────────

const FS_PACKS = [
  'sdcc',          // SDCC standard library + Z80 headers
  '65-nes',        // NES libraries (neslib, crt0)
  '65-c64',        // C64 libraries
  '65-atari2600',  // Atari 2600 libraries
  '65-apple2',     // Apple II libraries
  '65-atari8',     // Atari 8-bit libraries
  '65-none',       // Generic 6502 (no platform-specific libs)
];

// ── Copy helpers ─────────────────────────────────────────────────────────────

function cp(src, destDir) {
  if (!existsSync(src)) {
    console.warn(`  ⚠  not found: ${src}`);
    return false;
  }
  const dest = join(destDir, basename(src));
  copyFileSync(src, dest);
  const size = statSync(dest).size;
  const sizeStr = size > 1_000_000
    ? `${(size / 1_000_000).toFixed(1)} MB`
    : `${(size / 1_000).toFixed(0)} KB`;
  console.log(`  ✓  ${basename(dest)} (${sizeStr})`);
  return true;
}

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

// ── Main ─────────────────────────────────────────────────────────────────────

const wasmSrcDirs = [
  join(BWS_ROOT, 'src/worker/wasm'),
  join(BWS_ROOT, 'gen/worker/wasm'),
].filter(existsSync);

const fsSrcDir = join(BWS_ROOT, 'src/worker/fs');

const wasmOutDir = join(ASSETS_DIR, 'wasm');
const fsOutDir   = join(ASSETS_DIR, 'fs');
ensureDir(wasmOutDir);
ensureDir(fsOutDir);

// Copy Wasm modules
console.log('\nWasm modules:');
let wasmOk = 0, wasmMiss = 0;
for (const name of WASM_MODULES) {
  let found = false;
  for (const srcDir of wasmSrcDirs) {
    const wasmFile = join(srcDir, `${name}.wasm`);
    const jsFile   = join(srcDir, `${name}.js`);
    if (existsSync(wasmFile)) {
      cp(wasmFile, wasmOutDir);
      if (existsSync(jsFile)) cp(jsFile, wasmOutDir);
      found = true;
      break;
    }
  }
  if (found) wasmOk++; else { console.warn(`  ⚠  ${name}: no .wasm found in any wasm dir`); wasmMiss++; }
}

// Copy filesystem packs
console.log('\nFilesystem packs:');
let fsOk = 0, fsMiss = 0;
for (const name of FS_PACKS) {
  const dataFile = join(fsSrcDir, `fs${name}.data`);
  const jsFile   = join(fsSrcDir, `fs${name}.js`);
  const metaFile = join(fsSrcDir, `fs${name}.js.metadata`);

  const allExist = [dataFile, jsFile, metaFile].every(existsSync);
  if (!allExist) {
    console.warn(`  ⚠  fs${name}: missing one or more pack files`);
    fsMiss++;
    continue;
  }
  cp(dataFile, fsOutDir);
  cp(jsFile,   fsOutDir);
  cp(metaFile, fsOutDir);
  fsOk++;
}

// Copy platform-specific lib files needed at link time
// (these are fetched by populateExtraFiles during the link step)
console.log('\nPlatform lib files:');
const libSrcRoot = join(BWS_ROOT, 'src/worker/lib');
const libOutRoot = join(ASSETS_DIR, 'lib');

function copyLibDir(platform) {
  const src = join(libSrcRoot, platform);
  if (!existsSync(src)) { console.warn(`  ⚠  lib/${platform}: not found`); return; }
  const dest = join(libOutRoot, platform);
  ensureDir(dest);
  for (const f of readdirSync(src)) {
    const fPath = join(src, f);
    if (statSync(fPath).isFile()) cp(fPath, dest);
  }
}

const LIB_DIRS = ['coleco', 'msx', 'msx-libcv', 'zx', 'gb', 'nes', 'vcs',
                  'vectrex', 'williams', 'cpc', 'sms-sg1000-libcv',
                  'atari7800', 'atari8-800', 'arm32'];
for (const d of LIB_DIRS) copyLibDir(d);

// Summary
console.log(`
Summary:
  Wasm modules:     ${wasmOk} copied, ${wasmMiss} missing
  Filesystem packs: ${fsOk} copied, ${fsMiss} missing

Assets written to: ${ASSETS_DIR}
`);

if (wasmMiss + fsMiss > 0) {
  console.log('Note: Missing files may mean those toolchains have not been built yet.');
  console.log('Run `make` in the 8bitworkshop repo to build Wasm modules, then re-run this script.');
}
