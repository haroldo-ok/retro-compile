# Contributing to retro-compile

## Project structure

```
src/
  index.ts                  Public API: init(), compile(), precompile(), destroy()
  types.ts                  All public TypeScript types
  core/
    bridge.ts               WorkerBridge — Worker lifetime + Promise routing
    errors.ts               Error normalisation (all tool formats → CompileError)
    in-thread.ts            noWorker / Node.js in-thread compiler
    protocol.ts             Typed internal Worker message protocol
  platforms/
    profiles.ts             PlatformProfile registry (14 platforms)
  worker/
    worker.ts               Compiler Web Worker entry point
    engine-adapter.ts       Shim that registers 8bws internals as retroCompileEngine
scripts/
  build-vendor.mjs          Bundles 8bitworkshop builder → dist/vendor/builder-bundle.js
  copy-assets.mjs           Copies Wasm + FS packs from 8bws → dist/assets/
test/
  integration.test.mjs      29-test suite (no framework required)
```

## Development setup

You need two repos side by side:

```
repos/
  retro-compile/         ← this repo
  8bitworkshop-master/   ← https://github.com/sehugg/8bitworkshop
```

### 1. Clone and build 8bitworkshop

```bash
git clone https://github.com/sehugg/8bitworkshop
cd 8bitworkshop
npm install
make        # builds all Wasm toolchain binaries (takes ~5 min)
npm run tsbuild
```

### 2. Set up retro-compile

```bash
cd ../retro-compile
npm install
npm run typecheck
```

### 3. Build the full distribution

```bash
# Build TypeScript → dist/
tsc

# Bundle 8bitworkshop's builder into the engine IIFE
node scripts/build-vendor.mjs --8bws ../8bitworkshop

# Copy Wasm blobs and FS packs
node scripts/copy-assets.mjs --8bws ../8bitworkshop
```

### 4. Run tests

```bash
npm test
# or
node test/integration.test.mjs
```

### 5. Try the demo

```bash
npx serve . -p 4321
# open http://localhost:4321/demo.html
```

## Adding a new platform

1. Add the platform ID to the `Platform` union in `src/types.ts`
2. Add a `PlatformProfile` entry in `src/platforms/profiles.ts`
3. Add a sample code snippet in `demo.html`'s `PLATFORMS` array
4. Add the platform to the test matrix in `test/integration.test.mjs`
5. Verify the Wasm modules and FS packs it needs are covered by
   `scripts/copy-assets.mjs`

### Profile checklist

- [ ] `name` — human-readable display name
- [ ] `arch` — one of `'z80' | 'gbz80' | '6502' | '6809' | 'arm32'`
- [ ] `cCompiler` — tool that handles C→ASM (e.g. `'sdcc'`, `'cc65'`)
- [ ] `asmAssembler` — tool that handles ASM→OBJ
- [ ] `linker` — tool that handles OBJ→binary
- [ ] `filesystems` — Emscripten FS pack names to preload (from `src/worker/fs/`)
- [ ] `code_start` / `data_start` — memory map addresses (hex is fine)
- [ ] `rom_size` / `data_size` — if bounded
- [ ] `extra_link_files` / `extra_link_args` — platform runtime libs
- [ ] `defines` — `#define` symbols injected by the preprocessor
- [ ] `cfgfile` / `libargs` — for CC65/LD65 platforms

## How compilation works (end to end)

```
User calls compile({ platform: 'gb', source: '...' })
  ↓
index.ts — validates init() was called, forwards to WorkerBridge
  ↓
bridge.ts — posts CompileMessage to Web Worker with correlation ID
  ↓
worker.ts — receives message, resolves platform profile
  ↓
worker.ts — preloadWasm() fetches .js glue + .wasm binary for each tool
worker.ts — preloadFilesystem() fetches .metadata + .data for each FS pack
  ↓
worker.ts — getEngine() fetches vendor/builder-bundle.js, runs it
           engine-adapter.ts registers on globalThis.retroCompileEngine
  ↓
worker.ts — engine.store.reset(), populates files, injects profile params
worker.ts — engine.builder.handleMessage() runs the full pipeline:
             sdcc → (C→ASM) → sdasgb → (ASM→REL) → sdldz80 → (REL→IHX→ROM)
  ↓
worker.ts — applies GB checksum patch if profile.gbChecksumPatch
worker.ts — posts CompileResultMessage back with ROM Uint8Array
  ↓
bridge.ts — resolves the pending Promise with CompileSuccess
  ↓
User receives { ok: true, rom: Uint8Array }
```

## Coding conventions

- All public types in `src/types.ts` — nothing internal leaks
- `.js` extensions on all relative imports (required by node16 module resolution)
- Error matchers return `void` and mutate an `errors` array — keeps them composable
- Worker ↔ main thread communication is always typed via `protocol.ts`
- No `any` without a comment explaining why

## Testing philosophy

Tests run with plain `node` — no Jest, no Mocha, no test runner to install.
The `tryImport()` helper tries TypeScript source first (if running with tsx)
then compiled JS, so tests work in both modes.

Each suite is a logical group. Within a suite, `test()` calls are sequential.
Failures don't stop the suite — all tests always run so you see the full picture.

## Releasing

```bash
tsc                    # type-check + emit declarations
# run full build + asset pipeline
npm test               # must be 0 failures
npm version patch      # or minor / major
npm publish
```
