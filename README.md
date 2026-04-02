# retro-compile

**In-browser compiler toolchain for retro platforms.**  
Write C or assembly, get a ROM binary back. No build server needed.

```ts
import { init, compile } from 'retro-compile';

await init({ baseUrl: '/retro-compile/' });

const result = await compile({
  platform: 'gb',
  source: `
    #include <gb/gb.h>
    void main() {
      while(1) {}
    }
  `,
});

if (result.ok) {
  // result.rom is a Uint8Array — load it in any Game Boy emulator
  emulator.loadROM(result.rom);
} else {
  for (const err of result.errors) {
    console.error(`${err.path}:${err.line} — ${err.message}`);
  }
}
```

---

## How it works

All compilation runs in a **Web Worker** so it never blocks the main thread. Each compiler (SDCC, CC65, CMOC, etc.) is compiled to **WebAssembly** via Emscripten and loaded lazily — you only pay for the toolchain you actually use.

The compilation pipeline mirrors what [8bitworkshop](https://8bitworkshop.com) does internally:

```
C source
  ↓ mcpp (preprocessor)
  ↓ sdcc / cc65 / cmoc  (C → architecture-specific assembly)
  ↓ sdasz80 / ca65 / lwasm  (assembly → relocatable object)
  ↓ sdldz80 / ld65 / lwlink (link → Intel HEX or raw binary)
  ↓ parseIHX / raw copy (→ Uint8Array ROM)
```

Assembly sources skip the first two steps.

---

## Installation

```bash
npm install retro-compile
```

Then host the static assets (Wasm blobs, filesystem packs) somewhere your users
can reach. They live in `node_modules/retro-compile/dist/assets/`:

```
dist/
  index.js          ← ESM library
  index.cjs         ← CommonJS library  
  worker.js         ← Compiler Web Worker
  assets/
    wasm/
      sdcc.wasm     ← Z80/Game Boy C compiler
      sdasz80.wasm  ← Z80 assembler
      sdasgb.wasm   ← Game Boy assembler
      sdldz80.wasm  ← Z80 linker
      mcpp.wasm     ← C preprocessor
      cc65.wasm     ← 6502 C compiler
      ca65.wasm     ← 6502 assembler
      ld65.wasm     ← 6502 linker
      cmoc.wasm     ← 6809 C compiler
      ...
    fs/
      fssdcc.js           ← SDCC standard library FS
      fssdcc.js.metadata
      fssdcc.data
      fs65-nes.js         ← NES libraries FS
      fs65-nes.js.metadata
      fs65-nes.data
      fs65-c64.js         ← C64 libraries FS
      ...
```

Tell the library where you've hosted them:

```ts
await init({ baseUrl: 'https://cdn.yoursite.com/retro-compile/' });
```

---

## API

### `init(opts?)`

```ts
await init({
  baseUrl?: string,   // URL prefix for assets. Defaults to same directory as index.js.
  noWorker?: boolean, // Run on main thread (blocks!). Default: false.
});
```

Call once before any `compile()` calls. Safe to call multiple times (idempotent).

---

### `compile(opts)`

```ts
const result = await compile({
  platform: Platform,               // required — see table below
  source: string,                   // required — source code
  language?: 'c' | 'asm',          // default: 'c'
  files?: Record<string, string | Uint8Array>,  // extra headers / data files
  debug?: boolean,                  // include source mappings in result
});
```

Returns a `CompileResult`:

```ts
// Success
{ ok: true, rom: Uint8Array, symbols?, segments?, mappings? }

// Failure
{ ok: false, errors: CompileError[] }
```

#### `CompileError`

```ts
{
  line: number,         // 1-based line number
  col?: number,         // 1-based column (when available)
  path?: string,        // source file (may be a header)
  message: string,      // human-readable error text
  severity: 'error' | 'warning',
}
```

---

### `destroy()`

Terminates the Web Worker. Call when you're done to free resources.

---

## Platforms

| Platform ID      | Name                  | CPU   | C Compiler | Libraries            |
|------------------|-----------------------|-------|------------|----------------------|
| `gb`             | Nintendo Game Boy     | SM83  | SDCC       | GBDK (gb.lib)        |
| `coleco`         | ColecoVision          | Z80   | SDCC       | libcv / libcvu       |
| `msx`            | MSX                   | Z80   | SDCC       | crt0-msx             |
| `zx`             | ZX Spectrum           | Z80   | SDCC       | crt0-zx              |
| `mw8080bw`       | Midway 8080 B&W       | Z80   | SDCC       | —                    |
| `galaxian`       | Galaxian arcade       | Z80   | SDCC       | —                    |
| `base_z80`       | Generic Z80           | Z80   | SDCC       | —                    |
| `nes`            | Nintendo NES          | 6502  | CC65       | neslib2              |
| `c64`            | Commodore 64          | 6502  | CC65       | c64.lib              |
| `vcs`            | Atari 2600 VCS        | 6502  | CC65       | atari2600.lib        |
| `apple2`         | Apple II              | 6502  | CC65       | apple2.lib           |
| `atari8-800xl`   | Atari 8-bit 800XL     | 6502  | CC65       | atari.lib            |
| `vectrex`        | GCE Vectrex           | 6809  | CMOC       | libcmoc              |
| `williams-z80`   | Williams arcade (Z80) | Z80   | SDCC       | —                    |

---

## Examples

### Game Boy — C

```ts
const result = await compile({
  platform: 'gb',
  source: `
#include <gb/gb.h>
#include <stdio.h>

void main(void) {
  printf("Hello, Game Boy!\\n");
  while(1) wait_vbl_done();
}
  `,
});
```

### NES — C with header file

```ts
const result = await compile({
  platform: 'nes',
  source: `
#include "sprites.h"
void main(void) {
  setup_sprites();
  while(1) {}
}
  `,
  files: {
    'sprites.h': `void setup_sprites(void);`,
    'sprites.c': `void setup_sprites(void) { /* ... */ }`,
  },
});
```

### Z80 — direct assembly (ColecoVision)

```ts
const result = await compile({
  platform: 'coleco',
  language: 'asm',
  source: `
  .area _HOME
  .area _CODE
start:
  ld  hl, #0x8100
  ld  sp, hl
  ; ... your code
  `,
});
```

### Source-level debug info

```ts
const result = await compile({
  platform: 'gb',
  source: mySource,
  debug: true,
});

if (result.ok) {
  // Map ROM offsets back to source lines
  for (const m of result.mappings ?? []) {
    console.log(`${m.path}:${m.line} → ROM 0x${m.romOffset.toString(16)}`);
  }
}
```

---

## Architecture

```
src/
  index.ts              ← Public API: init(), compile(), destroy()
  types.ts              ← All public TypeScript types
  core/
    bridge.ts           ← WorkerBridge: spawns worker, routes Promises
    errors.ts           ← Error normalisation (all tool formats → CompileError)
    protocol.ts         ← Internal worker message types
  platforms/
    profiles.ts         ← PlatformProfile registry (replaces PLATFORM_PARAMS)
  worker/
    worker.ts           ← Compiler Web Worker entry point
```

The **worker** is the only part that imports 8bitworkshop internals. Everything
above it talks in clean, typed messages. This means you can swap the underlying
build engine without changing the public API.

---

## Credits

Compilation is powered by the open-source toolchain inside
[8bitworkshop](https://github.com/sehugg/8bitworkshop) by Steven E. Hugg,
which bundles SDCC, CC65, CMOC, SDAS, CA65, LD65, MCPP, and others as
Emscripten WebAssembly modules.

---

## License

MIT
