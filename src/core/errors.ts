// ─── Error normalisation ─────────────────────────────────────────────────────
// Each compiler/assembler/linker emits errors in its own format.
// This module converts all of them into the uniform CompileError type.

import type { CompileError } from '../types.js';

// ---------------------------------------------------------------------------
// Raw worker error shape (from 8bitworkshop internals)
// ---------------------------------------------------------------------------

export interface RawWorkerError {
  line: number;
  msg: string;
  path?: string;
}

// ---------------------------------------------------------------------------
// Normalise helpers
// ---------------------------------------------------------------------------

function severity(msg: string): 'error' | 'warning' {
  const lower = msg.toLowerCase();
  if (lower.startsWith('warning') || lower.includes(': warning')) return 'warning';
  return 'error';
}

function cleanPath(p: string | undefined): string | undefined {
  if (!p) return undefined;
  // Strip leading <stdin> artefacts
  if (p === '<stdin>' || p === 'stdin') return undefined;
  // Normalise Windows-style backslashes
  return p.replace(/\\/g, '/');
}

// ---------------------------------------------------------------------------
// Main normaliser
// ---------------------------------------------------------------------------

/**
 * Convert an array of raw worker errors (which may come from any tool) into
 * the clean, uniform CompileError shape exposed in the public API.
 */
export function normaliseErrors(raw: RawWorkerError[]): CompileError[] {
  return raw
    .filter(e => e && (e.msg || e.line))
    .map(e => ({
      line: e.line || 0,
      path: cleanPath(e.path),
      message: (e.msg || 'Unknown error').trim(),
      severity: severity(e.msg || ''),
    }));
}

// ---------------------------------------------------------------------------
// Individual tool error matchers
// Used by the worker to capture stderr lines during compilation.
// ---------------------------------------------------------------------------

/**
 * MSVC-style: `file.c(42) : error: message`
 * Used by SDCC and CC65.
 */
export function makeMsvcMatcher(errors: RawWorkerError[], fallbackPath: string) {
  const re_msvc  = /[/]*([^( ]+)\s*\((\d+)\)\s*:\s*(.+?):\s*(.*)/;
  const re_msvc2 = /\s*(at)\s+(\d+)\s*(:)\s*(.*)/;
  return (s: string) => {
    const m = re_msvc.exec(s) || re_msvc2.exec(s);
    if (m) {
      errors.push({ line: parseInt(m[2]), path: m[1], msg: m[4] });
    } else {
      // Don't swallow — include as a line-0 message so nothing is lost
      if (s.trim()) errors.push({ line: 0, path: fallbackPath, msg: s.trim() });
    }
  };
}

/**
 * SDAS assembler: `?ASxxxx-Error-<o> in line 12 of main.asm`
 */
export function makeSdasMatcher(errors: RawWorkerError[], fallbackPath: string) {
  const re1 = / in line (\d+) of (\S+)/;
  const re2 = / <\w> (.+)/;
  let pendingLine = 0;
  let pendingPath = fallbackPath;
  return (s: string) => {
    const m1 = re1.exec(s);
    if (m1) { pendingLine = parseInt(m1[1]); pendingPath = m1[2]; return; }
    const m2 = re2.exec(s);
    if (m2) {
      errors.push({ line: pendingLine, path: pendingPath, msg: m2[1] });
    }
  };
}

/**
 * SDLD linker: `?ASlink-Warning-Undefined Global ...`
 */
export function makeSdldMatcher(errors: RawWorkerError[]) {
  const re = /\?ASlink-(\w+)-(.+)/;
  return (s: string) => {
    const m = re.exec(s);
    if (m) errors.push({ line: 0, msg: m[2] });
  };
}

/**
 * mcpp preprocessor: `<stdin>:12: error: ...`
 */
export function makeMcppMatcher(errors: RawWorkerError[], fallbackPath: string) {
  const re = /<stdin>:(\d+): (.+)/;
  return (s: string) => {
    const m = re.exec(s);
    if (m) errors.push({ line: parseInt(m[1]), path: fallbackPath, msg: m[2] });
  };
}

/**
 * CA65 assembler: `main.s(42): Error: ...`
 */
export function makeCa65Matcher(errors: RawWorkerError[], fallbackPath: string) {
  const re = /(.+)\((\d+)\):\s*(\w+):\s*(.*)/;
  return (s: string) => {
    const m = re.exec(s);
    if (m) {
      errors.push({ line: parseInt(m[2]), path: m[1] || fallbackPath, msg: m[4] });
    }
  };
}
