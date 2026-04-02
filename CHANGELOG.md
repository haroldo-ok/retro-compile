# Changelog

All notable changes to retro-compile are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] — unreleased

### Added

**Core library**
- `init(opts?)` — initialises the compiler Web Worker; idempotent
- `compile(opts)` — compiles C or assembly source for a target platform; returns `Promise<CompileResult>`
- `precompile(platform)` — warms up Wasm modules and FS packs for a platform in the background
- `destroy()` — terminates the Worker and resets library state

**Platform support** (14 platforms across 3 CPU families)

| Platform       | CPU    | Toolchain              |
|----------------|--------|------------------------|
| `gb`           | SM83   | SDCC → sdasgb → sdldz80 |
| `coleco`       | Z80    | SDCC → sdasz80 → sdldz80 |
| `msx`          | Z80    | SDCC → sdasz80 → sdldz80 |
| `zx`           | Z80    | SDCC → sdasz80 → sdldz80 |
| `mw8080bw`     | Z80    | SDCC → sdasz80 → sdldz80 |
| `galaxian`     | Z80    | SDCC → sdasz80 → sdldz80 |
| `base_z80`     | Z80    | SDCC → sdasz80 → sdldz80 |
| `nes`          | 6502   | CC65 → CA65 → LD65 |
| `c64`          | 6510   | CC65 → CA65 → LD65 |
| `vcs`          | 6507   | CC65 → CA65 → LD65 |
| `apple2`       | 6502   | CC65 → CA65 → LD65 |
| `atari8-800xl` | 6502   | CC65 → CA65 → LD65 |
| `vectrex`      | 6809   | CMOC → LWASM → LWLINK |
| `williams-z80` | Z80    | SDCC → sdasz80 → sdldz80 |

**Result types**
- `CompileSuccess` — `{ ok: true, rom: Uint8Array, symbols?, segments?, mappings? }`
- `CompileFailure` — `{ ok: false, errors: CompileError[] }`
- `CompileError` — `{ line, col?, path?, message, severity: 'error'|'warning' }`
- `Segment` — `{ name, start, size, type: 'rom'|'ram'|null }`
- `SourceMapping` — `{ path, line, romOffset, insns? }` (only when `debug: true`)

**Build tooling**
- `scripts/build-vendor.mjs` — bundles 8bitworkshop's builder pipeline into a self-contained IIFE (`dist/vendor/builder-bundle.js`)
- `scripts/copy-assets.mjs` — copies Wasm binaries and Emscripten FS packs from the 8bitworkshop source tree into `dist/assets/`
- `build.mjs` — orchestrates `tsc` type-check + esbuild for library and worker bundles

**Worker architecture**
- All compilation runs in a dedicated Web Worker — never blocks the main thread
- Wasm modules loaded lazily and cached across compile calls
- Emscripten filesystem packs loaded with async `fetch()` instead of synchronous XHR
- FS metadata synced into the engine via `syncFs()` after preloading
- XHR interceptor rewrites 8bitworkshop-internal `lib/` paths to `baseUrl/lib/`
- Game Boy header checksum patched automatically post-link

**In-thread mode** (`noWorker: true`)
- Full compilation pipeline available without a Web Worker
- Uses Node.js `vm.runInThisContext` for correct global scope when available
- Useful for CLI tools, server-side rendering, and test environments

**Error normalisation**
- Unified `CompileError` shape regardless of which tool emitted the error
- Matchers for: SDCC (MSVC-style), SDAS, SDLD, mcpp, CA65
- `<stdin>` path stripping, Windows backslash normalisation

**Demo**
- `demo.html` — self-contained interactive demo with platform picker, language toggle, code editor, error display, ROM info panel with segment visualiser, and ROM download

**Tests** — 29 tests, no framework required
- Platform profile structural validation (all 14 platforms)
- Error normalisation (all 5 tool formats)
- Profile → params mapping
- Game Boy checksum algorithm (spec-verified)
- XHR URL rewriting
- Public API surface and pre-init safety
