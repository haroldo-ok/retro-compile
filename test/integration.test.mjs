// test/integration.test.mjs
import assert from 'node:assert/strict';

let passed = 0, failed = 0;
const suites = [];

function suite(name, fn) { suites.push({ name, fn }); }
async function test(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); failed++; }
}

async function tryImport(...paths) {
  for (const p of paths) { try { return await import(p); } catch {} }
  throw new Error(`Could not import any of: ${paths.join(', ')}`);
}

const profiles = await tryImport('../src/platforms/profiles.ts', '../dist/platforms/profiles.js');
const errors   = await tryImport('../src/core/errors.ts',        '../dist/core/errors.js');
const api      = await tryImport('../src/index.ts',              '../dist/index.js');

const { PLATFORM_PROFILES, getProfile } = profiles;
const { normaliseErrors, makeMsvcMatcher, makeSdasMatcher, makeSdldMatcher, makeMcppMatcher, makeCa65Matcher } = errors;

// ── Platform profile validation ──────────────────────────────────────────────
suite('Platform profiles', () => {
  const ALL = ['gb','coleco','msx','zx','mw8080bw','galaxian','base_z80',
               'nes','c64','vcs','apple2','atari8-800xl','vectrex','williams-z80'];

  test('All 14 platforms have complete profiles', () => {
    for (const p of ALL) {
      const prof = PLATFORM_PROFILES[p];
      assert.ok(prof,              `Missing profile for '${p}'`);
      assert.ok(prof.name,         `'${p}': missing name`);
      assert.ok(prof.arch,         `'${p}': missing arch`);
      assert.ok(prof.cCompiler,    `'${p}': missing cCompiler`);
      assert.ok(prof.asmAssembler, `'${p}': missing asmAssembler`);
      assert.ok(prof.linker,       `'${p}': missing linker`);
      assert.ok(Array.isArray(prof.filesystems), `'${p}': filesystems must be array`);
    }
  });

  test('Z80 platforms use sdcc / sdldz80', () => {
    for (const p of ['coleco','msx','zx','base_z80','galaxian','mw8080bw','williams-z80']) {
      const prof = getProfile(p);
      assert.equal(prof.cCompiler, 'sdcc',    `${p}: expected sdcc`);
      assert.equal(prof.linker,    'sdldz80', `${p}: expected sdldz80`);
    }
  });

  test('Game Boy uses gbz80 arch + sdasgb + checksum patch', () => {
    const gb = getProfile('gb');
    assert.equal(gb.arch, 'gbz80');
    assert.equal(gb.asmAssembler, 'sdasgb');
    assert.equal(gb.gbChecksumPatch, true);
    assert.equal(gb.codeseg_start, 0x200);
  });

  test('6502 platforms use cc65 / ca65 / ld65', () => {
    for (const p of ['nes','c64','vcs','apple2','atari8-800xl']) {
      const prof = getProfile(p);
      assert.equal(prof.cCompiler,    'cc65', `${p}`);
      assert.equal(prof.asmAssembler, 'ca65', `${p}`);
      assert.equal(prof.linker,       'ld65', `${p}`);
    }
  });

  test('Vectrex uses 6809 / cmoc / lwlink', () => {
    const v = getProfile('vectrex');
    assert.equal(v.arch, '6809');
    assert.equal(v.cCompiler, 'cmoc');
    assert.equal(v.linker, 'lwlink');
    assert.ok(v.extra_compile_args?.includes('--vectrex'));
  });

  test('NES has cfgfile, libargs and __NES__ define', () => {
    const nes = getProfile('nes');
    assert.ok(nes.cfgfile);
    assert.ok(nes.libargs?.includes('crt0.o'));
    assert.ok(nes.defines?.includes('__NES__'));
  });

  test('VCS has tiny 128-byte RAM segment', () => {
    const vcs = getProfile('vcs');
    assert.equal(vcs.data_start, 0x80);
    assert.equal(vcs.data_size,  0x80);
  });

  test('ColecoVision has CV_CV preproc define', () => {
    const col = getProfile('coleco');
    assert.ok(col.extra_preproc_args?.includes('CV_CV'));
  });

  test('getProfile throws for unknown platforms', () => {
    assert.throws(() => getProfile('snes'),     /unknown platform/i);
    assert.throws(() => getProfile('playstation'), /unknown platform/i);
  });
});

// ── Error normalisation ───────────────────────────────────────────────────────
suite('Error normalisation', () => {
  test('Converts raw errors to CompileError shape', () => {
    const result = normaliseErrors([
      { line: 5, msg: 'undefined symbol _foo', path: 'main.c' },
      { line: 0, msg: 'warning: unused variable x' },
    ]);
    assert.equal(result.length, 2);
    assert.equal(result[0].line, 5);
    assert.equal(result[0].severity, 'error');
    assert.equal(result[1].severity, 'warning');
  });

  test('Strips <stdin> and "stdin" paths', () => {
    const result = normaliseErrors([
      { line: 3, msg: 'err', path: '<stdin>' },
      { line: 1, msg: 'err', path: 'stdin' },
    ]);
    assert.equal(result[0].path, undefined);
    assert.equal(result[1].path, undefined);
  });

  test('Normalises Windows backslash paths', () => {
    const result = normaliseErrors([{ line: 1, msg: 'err', path: 'src\\main.c' }]);
    assert.equal(result[0].path, 'src/main.c');
  });

  test('MSVC matcher — file(line) : type: msg', () => {
    const errors = [];
    const m = makeMsvcMatcher(errors, 'main.c');
    m('main.c(42) : error: syntax error');
    m('util.c(7) : warning 190: empty source');
    assert.equal(errors[0].line, 42); assert.equal(errors[0].path, 'main.c');
    assert.equal(errors[1].line, 7);  assert.equal(errors[1].path, 'util.c');
  });

  test('SDAS matcher — two-line format', () => {
    const errors = [];
    const m = makeSdasMatcher(errors, 'main.asm');
    m('?ASxxxx-Error-<o> in line 15 of main.asm null');
    m("              <o> Unknown Mnemonic 'LDAX'");
    assert.equal(errors.length, 1);
    assert.equal(errors[0].line, 15);
    assert.ok(errors[0].msg.includes('Unknown Mnemonic'));
  });

  test('SDLD matcher — linker messages', () => {
    const errors = [];
    const m = makeSdldMatcher(errors);
    m("?ASlink-Warning-Undefined Global '_main'");
    m("?ASlink-Error-Conflicting segments");
    assert.equal(errors.length, 2);
    assert.ok(errors[0].msg.includes('Undefined Global'));
    assert.ok(errors[1].msg.includes('Conflicting'));
  });

  test('mcpp matcher — preprocessor error', () => {
    const errors = [];
    makeMcppMatcher(errors, 'main.c')('<stdin>:7: error: undefined macro FOO');
    assert.equal(errors[0].line, 7);
    assert.ok(errors[0].msg.includes('undefined macro'));
  });

  test('CA65 matcher — assembler error', () => {
    const errors = [];
    makeCa65Matcher(errors, 'main.s')('main.s(33): Error: Unknown instruction: NOOP');
    assert.equal(errors[0].line, 33);
    assert.equal(errors[0].path, 'main.s');
  });
});

// ── Profile → params mapping ──────────────────────────────────────────────────
suite('Profile → params mapping', () => {
  function profileToParams(p) {
    return {
      arch: p.arch, code_start: p.code_start, codeseg_start: p.codeseg_start,
      rom_start: p.rom_start, rom_size: p.rom_size,
      data_start: p.data_start, data_size: p.data_size, stack_end: p.stack_end,
      extra_link_files: p.extra_link_files, extra_link_args: p.extra_link_args,
      define: p.defines, cfgfile: p.cfgfile, libargs: p.libargs,
    };
  }

  test('Game Boy params — correct memory layout', () => {
    const p = profileToParams(getProfile('gb'));
    assert.equal(p.arch, 'gbz80');
    assert.equal(p.code_start, 0x0);
    assert.equal(p.codeseg_start, 0x200);
    assert.equal(p.rom_size, 0x8000);
    assert.equal(p.data_start, 0xc0a0);
  });

  test('ColecoVision params — ROM at 0x8000', () => {
    const p = profileToParams(getProfile('coleco'));
    assert.equal(p.rom_start, 0x8000);
    assert.equal(p.code_start, 0x8100);
  });

  test('NES params — carries cfgfile and libargs through', () => {
    const p = profileToParams(getProfile('nes'));
    assert.equal(p.cfgfile, 'neslib2.cfg');
    assert.ok(p.define?.includes('__NES__'));
  });
});

// ── Game Boy checksum ─────────────────────────────────────────────────────────
suite('Game Boy checksum patch', () => {
  function patch(rom) {
    rom = new Uint8Array(rom);
    let cs = 0;
    for (let a = 0x0134; a <= 0x014c; a++) cs = cs - rom[a] - 1;
    rom[0x014d] = cs & 0xff;
    return rom;
  }

  // The GB boot ROM checks: x=0; for a in 0x134..0x14D: x=x-mem[a]-1; x&0xFF must equal 0xFF
  function verify(rom) {
    let x = 0;
    for (let a = 0x0134; a <= 0x014d; a++) x = x - rom[a] - 1;
    return x & 0xff;
  }

  test('Patched ROM passes checksum verification', () => {
    const rom = patch(new Uint8Array(0x8000));
    assert.equal(verify(rom), 0xff);
  });

  test('All-zero header gets checksum 0xE7', () => {
    const rom = patch(new Uint8Array(0x8000));
    assert.equal(rom[0x014d], 0xe7);
    assert.equal(verify(rom), 0xff);
  });

  test('Non-zero header bytes produce different checksum', () => {
    const buf = new Uint8Array(0x8000);
    buf[0x0134] = 0x47; // 'G'
    buf[0x0135] = 0x42; // 'B'
    const rom = patch(buf);
    assert.notEqual(rom[0x014d], 0xe7);  // different from all-zero case
    assert.equal(verify(rom), 0xff);      // but still passes verification
  });
});

// ── URL rewriting ─────────────────────────────────────────────────────────────
suite('Lib URL rewriting (XHR interceptor)', () => {
  const BASE = 'https://cdn.example.com/retro-compile/lib/';

  function rewriteLibUrl(url, libBaseUrl) {
    const m = url.match(/(?:src\/worker\/)?lib\/(.+)$/);
    if (m) return libBaseUrl + m[1];
    return url;
  }

  test('Rewrites 8bws-relative lib paths', () => {
    assert.equal(
      rewriteLibUrl('../../src/worker/lib/coleco/crt0.rel', BASE),
      BASE + 'coleco/crt0.rel'
    );
  });

  test('Rewrites short lib/ paths', () => {
    assert.equal(rewriteLibUrl('lib/nes/crt0.o', BASE), BASE + 'nes/crt0.o');
  });

  test('Rewrites nested paths', () => {
    assert.equal(
      rewriteLibUrl('src/worker/lib/gb/gbz80.lib', BASE),
      BASE + 'gb/gbz80.lib'
    );
  });

  test('Leaves unrelated URLs untouched', () => {
    const url = 'https://other.example.com/wasm/sdcc.wasm';
    assert.equal(rewriteLibUrl(url, BASE), url);
  });
});

// ── Public API surface ────────────────────────────────────────────────────────
suite('Public API surface', () => {
  test('Exports init, compile, destroy, precompile', () => {
    assert.equal(typeof api.init,       'function');
    assert.equal(typeof api.compile,    'function');
    assert.equal(typeof api.destroy,    'function');
    assert.equal(typeof api.precompile, 'function');
  });

  test('compile() throws before init()', async () => {
    api.destroy(); // reset any previous init state
    await assert.rejects(() => api.compile({ platform: 'gb', source: '' }), /init\(\)/);
  });

  test('precompile() is safe to call before init (no-op)', () => {
    api.destroy();
    // Should not throw — just silently ignored
    assert.doesNotThrow(() => api.precompile('gb'));
  });
});

// ── Run ───────────────────────────────────────────────────────────────────────
for (const { name, fn } of suites) {
  console.log(`\n${name}`);
  await fn();
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
