# retro-compile

**In-browser compiler toolchain for retro platforms.**  
Write C or assembly, get a ROM binary back. No build server. No Emscripten required.

```ts
import { init, compile } from 'retro-compile';

await init({ baseUrl: '/retro-compile/' });

const result = await compile({
  platform: 'gb',
  source: `
    #include <gb/gb.h>
    void main(void) { while(1) wait_vbl_done(); }
  `,
});

if (result.ok) {
  emulator.loadROM(result.rom); // Uint8Array
} else {
  for (const err of result.errors)
    console.error(`${err.path}:${err.line} — ${err.message}`);
}
```

---

## How it works

All compilation runs in a **Web Worker** — never blocks the main thread.  
Each compiler (SDCC, CC65, CMOC…) is a pre-built **WebAssembly** module loaded lazily, so you only pay for the toolchain you actually use.

```
C source
  → mcpp (preprocessor)
  → sdcc / cc65 / cmoc  (C → architecture ASM)
  → sdasz80 / ca65 / lwasm  (ASM → relocatable object)
  → sdldz80 / ld65 / lwlink  (link → Intel HEX / raw binary)
  → Uint8Array ROM
```

Assembly sources skip the first two steps.

---

## Setup

### 1 — Get the 8bitworkshop compiled assets

You need the Wasm toolchain binaries and standard-library filesystem packs from
[8bitworkshop](https://github.com/sehugg/8bitworkshop). If you have a pre-built
archive (the `.7z` / `.zip` that contains `src/worker/wasm/*.wasm` and
`src/worker/fs/*.data`) you can use it directly without running `make`.

### 2 — Copy assets into the library

```bash
node scripts/copy-assets.mjs --8bws /path/to/8bitworkshop
```

This copies Wasm binaries and FS packs into `dist/assets/`.

### 3 — Build the vendor engine bundle

No esbuild or npm install required — uses only Node.js built-ins:

```bash
# First compile the 8bitworkshop worker TypeScript (if not already compiled):
cd /path/to/8bitworkshop
tsc -p src/common/tsconfig.json
tsc -p src/worker/tsconfig.json
cd -

# Then bundle into an IIFE the worker can fetch at runtime:
node scripts/bundle-vendor-node.mjs --8bws /path/to/8bitworkshop
```

Output: `dist/vendor/builder-bundle.js`

### 4 — Serve and use

```bash
npm run demo          # npx serve . -p 4321
# open http://localhost:4321/demo.html
```

Or host `dist/` on any static server and point `init()` at it:

```ts
await init({ baseUrl: 'https://cdn.yoursite.com/retro-compile/' });
```

---

## API

### `init(opts?)`

```ts
await init({
  baseUrl?: string,   // URL of hosted assets directory. Defaults to same dir as index.js.
  noWorker?: boolean, // Run on main thread (blocks). Useful in Node.js. Default: false.
});
```

Idempotent — safe to call multiple times.

---

### `precompile(platform)`

```ts
precompile('gb');  // fire-and-forget, no await needed
```

Warms up Wasm modules and FS packs for a platform in the background. Call after
`init()` to eliminate cold-start latency on the first `compile()`. Safe to call
before `init()` (no-op).

---

### `compile(opts)`

```ts
const result = await compile({
  platform: Platform,                             // required
  source:   string,                               // required
  language?: 'c' | 'asm',                        // default 'c'
  files?:    Record<string, string | Uint8Array>, // extra headers / data files
  debug?:    boolean,                             // include source mappings
});
```

Returns `CompileResult`:

```ts
// Success
{ ok: true, rom: Uint8Array, symbols?, segments?, mappings? }

// Failure
{ ok: false, errors: CompileError[] }
```

`CompileError`: `{ line, col?, path?, message, severity: 'error'|'warning' }`

---

### `destroy()`

Terminates the worker. Call when done to free resources.

---

## Platforms

| ID               | Name                  | CPU    | C compiler |
|------------------|-----------------------|--------|------------|
| `gb`             | Nintendo Game Boy     | SM83   | SDCC       |
| `coleco`         | ColecoVision          | Z80    | SDCC       |
| `msx`            | MSX                   | Z80    | SDCC       |
| `zx`             | ZX Spectrum           | Z80    | SDCC       |
| `mw8080bw`       | Midway 8080 B&W       | Z80    | SDCC       |
| `galaxian`       | Galaxian arcade       | Z80    | SDCC       |
| `base_z80`       | Generic Z80           | Z80    | SDCC       |
| `williams-z80`   | Williams arcade       | Z80    | SDCC       |
| `nes`            | Nintendo NES          | 6502   | CC65       |
| `c64`            | Commodore 64          | 6510   | CC65       |
| `vcs`            | Atari 2600 VCS        | 6507   | CC65       |
| `apple2`         | Apple II              | 6502   | CC65       |
| `atari8-800xl`   | Atari 8-bit 800XL     | 6502   | CC65       |
| `vectrex`        | GCE Vectrex           | 6809   | CMOC       |

---

## Scripts reference

| Script | What it does |
|--------|-------------|
| `tsc` | Type-check + compile TypeScript → `dist/` |
| `node scripts/bundle-vendor-node.mjs --8bws <path>` | Bundle 8bws builder → `dist/vendor/builder-bundle.js` (no npm needed) |
| `node scripts/copy-assets.mjs --8bws <path>` | Copy Wasm + FS packs → `dist/assets/` |
| `npm test` | Run 29-test suite |
| `npm run demo` | Serve on port 4321 |

---

## Architecture

```
src/
  index.ts              init(), compile(), precompile(), destroy()
  types.ts              All public TypeScript types
  core/
    bridge.ts           WorkerBridge — Worker lifetime + Promise routing
    errors.ts           Error normalisation (SDCC/CA65/SDAS/SDLD/mcpp → CompileError)
    in-thread.ts        noWorker / Node.js in-thread path
    protocol.ts         Typed Worker ↔ main thread message protocol
  platforms/
    profiles.ts         PlatformProfile registry (14 platforms)
  worker/
    worker.ts           Compiler Web Worker entry point
    engine-adapter.ts   Shim: wraps 8bws internals as retroCompileEngine
scripts/
  bundle-vendor-node.mjs  Pure Node.js bundler (no esbuild needed)
  copy-assets.mjs         Copies Wasm + FS packs from 8bws source tree
```

---

## Credits

Powered by [8bitworkshop](https://github.com/sehugg/8bitworkshop) by Steven E. Hugg
(SDCC, CC65, CMOC, and all their toolchain friends, compiled to WebAssembly).

## License

MIT
