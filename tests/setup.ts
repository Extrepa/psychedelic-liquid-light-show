// Global test setup
// - Polyfill/Mock MediaRecorder for useVideoRecording tests
// - Provide small helpers if needed

// Stub URL.createObjectURL/revokeObjectURL for jsdom
if (!('createObjectURL' in URL)) {
  // @ts-expect-error
  URL.createObjectURL = () => 'blob:mock-url';
}
if (!('revokeObjectURL' in URL)) {
  // @ts-expect-error
  URL.revokeObjectURL = () => {};
}

// Provide a robust localStorage mock to avoid jsdom/cli quirks
class LocalStorageMock implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}
// @ts-expect-error override global for tests
globalThis.localStorage = new LocalStorageMock();

class MockMediaRecorder {
  public state: 'inactive' | 'recording' | 'paused' = 'inactive';
  public ondataavailable: ((event: BlobEvent) => void) | null = null;
  public onstop: (() => void) | null = null;

  constructor(public stream: MediaStream, public options?: MediaRecorderOptions) {}

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    // Push a tiny blob to simulate data
    const blob = new Blob([new Uint8Array([1,2,3])], { type: 'video/webm' });
    const evt = { data: blob } as any; // BlobEvent is not available in jsdom
    this.ondataavailable && this.ondataavailable(evt);
    this.onstop && this.onstop();
  }
}

// @ts-expect-error - assign to global for jsdom
globalThis.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

// Basic mock for MediaStream when needed
// @ts-expect-error - jsdom doesn't have real MediaStream; create minimal stub
globalThis.MediaStream = class {} as unknown as typeof MediaStream;
