/**
 * @format
 */

import {
  base64ToUint8,
  splitCompleteUtf8,
  uint8ToBase64,
} from '../src/sanctions/fileIo';

function encodeUtf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

describe('fileIo UTF-8 helpers', () => {
  test('uint8 base64 round-trip', () => {
    const original = encodeUtf8('Hello, Mkweli — مرحبا');
    const b64 = uint8ToBase64(original);
    const back = base64ToUint8(b64);
    expect(Array.from(back)).toEqual(Array.from(original));
  });

  test('splitCompleteUtf8 keeps full ASCII chunks intact', () => {
    const bytes = encodeUtf8('ABCDEFGHIJ');
    const {complete, remainder} = splitCompleteUtf8(bytes);
    expect(remainder.length).toBe(0);
    expect(Array.from(complete)).toEqual(Array.from(bytes));
  });

  test('splitCompleteUtf8 holds incomplete multi-byte char for next chunk', () => {
    // "é" is C3 A9 in UTF-8 — simulate split after first byte
    const full = encodeUtf8('café');
    // café = 63 61 66 c3 a9
    expect(full[full.length - 2]).toBe(0xc3);
    expect(full[full.length - 1]).toBe(0xa9);

    const partial = full.subarray(0, full.length - 1); // ends with 0xc3 only
    const {complete, remainder} = splitCompleteUtf8(partial);
    expect(remainder.length).toBe(1);
    expect(remainder[0]).toBe(0xc3);
    // complete should decode to "caf"
    expect(new TextDecoder().decode(complete)).toBe('caf');

    // reassemble with next byte
    const next = new Uint8Array([...remainder, 0xa9]);
    const joined = splitCompleteUtf8(next);
    expect(joined.remainder.length).toBe(0);
    expect(new TextDecoder().decode(joined.complete)).toBe('é');
  });

  test('splitCompleteUtf8 handles Arabic multi-byte names at boundary', () => {
    const name = 'حاجي'; // Arabic — multi-byte UTF-8
    const bytes = encodeUtf8(name);
    // Split after first byte of last character
    for (let cut = 1; cut < bytes.length; cut++) {
      const head = bytes.subarray(0, cut);
      const tail = bytes.subarray(cut);
      const a = splitCompleteUtf8(head);
      const combined = new Uint8Array(a.remainder.length + tail.length);
      combined.set(a.remainder, 0);
      combined.set(tail, a.remainder.length);
      const b = splitCompleteUtf8(combined);
      const text =
        new TextDecoder().decode(a.complete) +
        new TextDecoder().decode(b.complete);
      expect(text).toBe(name);
    }
  });
});
