// Minimal WebGPU shim for three-globe's optional imports when using older three.js releases.
// The application does not rely on these exports at runtime, so lightweight placeholders are sufficient.
export class StorageInstancedBufferAttribute {
  constructor(public data?: any, public itemSize?: number) {}
}

export class WebGPURenderer {
  async computeAsync(_node?: unknown): Promise<void> {
    return Promise.resolve();
  }

  async getArrayBufferAsync(_attribute?: unknown): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0));
  }
}
