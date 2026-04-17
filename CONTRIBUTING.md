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
    protocol.ts             Typed Worker ↔ main thread message protocol
  platforms/
    profiles.ts             PlatformProfile registry (14 platforms)
  worker/
    worker.ts               Compiler Web Worker entry point
    engine-adapter.ts       Shim that registers 8bws internals as retroCompileEngine
scripts/
  bundle-vendor-node.mjs    Pure Node.js bundler — no esbuild needed
  copy-assets.mjs           Copies Wasm + FS packs from 8bws → dist/assets/
test/
  integration.test.mjs      30-test suite (plain node, no test framework)
```

## Development setup

You need two repos side by side:

```
repos/
  retro-compile/           ← this repo
  8bitworkshop/            ← https://github.com/sehugg/8bitworkshop
                             (or a pre-compiled archive/zip)
```

### Option A — From a pre-compiled 8bitworkshop archive

If you have a `.7z` or `.zip` that already contains `src/worker/wasm/*.wasm`
and `src/worker/fs/*.data` (i.e. the Emscripten build has already been run),
you do **not** need Emscripten or `make`. You just need to compile the
TypeScript source for the worker pipeline:

```bash
cd /path/to/8bitworkshop
tsc -p src/common/tsconfig.json
tsc -p src/worker/tsconfig.json
```

### Option B — From a clean 8bitworkshop clone

```bash
git clone https://github.com/sehugg/8bitworkshop
cd 8bitworkshop
# Install Emscripten first: https://emscripten.org/docs/getting_started/
npm install
make          # builds all Wasm toolchain binaries (~5-10 min)
npm run tsbuild
```

### Set up retro-compile

```bash
cd retro-compile
npm install   # only installs typescript — no esbuild needed
npm run typecheck
```

### Build everything

```bash
# 1. Copy Wasm binaries and FS packs from 8bws into dist/assets/
node scripts/copy-assets.mjs --8bws /path/to/8bitworkshop

# 2. Bundle the 8bws builder pipeline into a single IIFE
#    (uses only Node.js built-ins — no esbuild, no npm install required)
node scripts/bundle-vendor-node.mjs --8bws /path/to/8bitworkshop

# 3. Compile the library TypeScript
tsc
```

### Run tests

```bash
npm test
# or
node test/integration.test.mjs
```

### Try the demo

```bash
npm run demo
# open http://localhost:4321/demo.html
```

---

## How bundle-vendor-node.mjs works

This script replaces a traditional esbuild/webpack bundler with a pure
Node.js approach:

1. Compiles `builder.ts`, `platforms.ts`, and `workertools.ts` to CommonJS
   using `tsc` (already in the archive/repo)
2. Walks the `require()` graph starting from those three entry points,
   collecting all local module files in topological order
3. Wraps each module in a minimal CJS shim (`__define` / `__require`)
4. Emits a single IIFE that:
   - Inlines all 35 modules
   - Provides browser/Worker-safe global shims
   - Wires the XHR interceptor for `lib/` file rewrites
   - Registers `globalThis.retroCompileEngine` with `store`, `builder`,
     `PLATFORM_PARAMS`, `configure`, and `syncFs`

The result (`dist/vendor/builder-bundle.js`) is fetched and executed by the
compiler Web Worker at runtime via `new Function(code)()`.

---

## Adding a new platform

1. Add the platform ID to the `Platform` union in `src/types.ts`
2. Add a `PlatformProfile` entry in `src/platforms/profiles.ts`
3. Add a sample snippet to `demo.html`'s `PLATFORMS` array
4. Add it to the test matrix in `test/integration.test.mjs`
5. Verify the required Wasm modules and FS packs exist in `dist/assets/`

### Profile checklist

- [ ] `name` — human-readable display name
- [ ] `arch` — `'z80' | 'gbz80' | '6502' | '6809' | 'arm32'`
- [ ] `cCompiler` / `asmAssembler` / `linker` — tool IDs
- [ ] `filesystems` — FS pack names to preload (from `src/worker/fs/`)
- [ ] `code_start` / `data_start` — memory map (hex is fine)
- [ ] `rom_size` / `data_size` — if bounded
- [ ] `extra_link_files` / `extra_link_args` — platform runtime libs
- [ ] `defines` — preprocessor symbols
- [ ] `cfgfile` / `libargs` — for CC65/LD65 platforms

---

## Data-flow (end to end)

```
User calls compile({ platform: 'gb', source: '...' })
  ↓
index.ts — checks init(), forwards to WorkerBridge
  ↓
bridge.ts — posts CompileMessage to Web Worker with correlation ID
  ↓
worker.ts — resolves platform profile
  ↓ (parallel)
  ├─ preloadWasm()  — fetch .js glue + .wasm for each required tool
  └─ preloadFilesystem() — fetch .metadata + .data for each FS pack
  ↓
worker.ts — getEngine() fetches dist/vendor/builder-bundle.js, executes it
            engine-adapter.ts registers retroCompileEngine on globalThis
  ↓
worker.ts — engine.configure() installs XHR interceptor for lib/ paths
            engine.syncFs() pushes preloaded FS blobs into emglobal scope
  ↓
worker.ts — store.reset(), populate files, inject profile params
            builder.handleMessage() runs the full tool pipeline:
            sdcc → sdasgb → sdldz80 → ROM (for Game Boy)
            cc65 → ca65 → ld65 → ROM (for NES/C64)
  ↓
worker.ts — applies GB header checksum patch if profile.gbChecksumPatch
            posts CompileResultMessage back (ROM transferred, not copied)
  ↓
bridge.ts — resolves pending Promise with CompileSuccess
  ↓
User: { ok: true, rom: Uint8Array }
```

---

## Coding conventions

- All public types live in `src/types.ts` — nothing internal leaks through
- `.js` extensions on all relative imports (node16 module resolution)
- Error matchers mutate an `errors[]` array — keeps them composable
- Worker ↔ main thread is always typed via `protocol.ts`
- No `any` without a comment

## Testing philosophy

Tests run with plain `node` — no Jest, no Mocha. `tryImport()` tries TypeScript
source first, then compiled JS, so tests work in both modes. Each suite is a
logical group; failures don't stop the suite so you always see the full picture.

## Releasing

```bash
tsc                    # type-check + emit
node test/integration.test.mjs   # must be 0 failures
npm version patch      # or minor / major
npm publish
```
