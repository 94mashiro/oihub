import { fakeBrowser } from 'wxt/testing';

export function installFakeBrowser(): void {
  // WXT storage depends on a global `browser` object.
  (globalThis as any).browser = fakeBrowser;
}

export function resetFakeBrowser(): void {
  if (typeof (fakeBrowser as any).reset === 'function') {
    (fakeBrowser as any).reset();
  }
}

export async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
}

export async function waitForStoreReady<TStore extends { getState: () => { ready: boolean } }>(
  store: TStore,
  timeoutMs = 1000,
): Promise<void> {
  const start = Date.now();
  while (!store.getState().ready) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Store hydration timeout');
    }
    await flushMicrotasks();
  }
}
