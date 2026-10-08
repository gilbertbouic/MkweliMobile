/**
 * Ambient types for runtime globals that Hermes / React Native provide (and
 * Node provides under Jest) but that the React Native TypeScript config does
 * not declare. Kept minimal: only what this codebase uses.
 */
declare var global: typeof globalThis;

declare function btoa(data: string): string;
declare function atob(data: string): string;

interface TextDecoderOptions {
  fatal?: boolean;
  ignoreBOM?: boolean;
}
interface TextDecodeOptions {
  stream?: boolean;
}
declare class TextDecoder {
  constructor(label?: string, options?: TextDecoderOptions);
  readonly encoding: string;
  decode(input?: ArrayBufferView | ArrayBuffer, options?: TextDecodeOptions): string;
}
declare class TextEncoder {
  readonly encoding: string;
  encode(input?: string): Uint8Array;
}

declare var performance: {now(): number};
