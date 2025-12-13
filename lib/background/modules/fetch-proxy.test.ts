import { describe, expect, test } from 'bun:test';
import { fetchProxyModule } from './fetch-proxy';
import { flushMicrotasks } from '@/lib/test/wxt-test-helpers';
import { messageRouter } from '@/lib/background';

describe('fetchProxyModule', () => {
  test('registers FETCH handler', () => {
    let registeredType: string | undefined;
    let registeredHandler: any;

    const originalRegister = messageRouter.register.bind(messageRouter);
    (messageRouter as any).register = (type: string, handler: any) => {
      registeredType = type;
      registeredHandler = handler;
    };

    fetchProxyModule.init();

    expect(registeredType).toBe('FETCH');
    expect(typeof registeredHandler).toBe('function');

    (messageRouter as any).register = originalRegister;
  });

  test('handles JSON response', async () => {
    let handler: any;
    const originalRegister = messageRouter.register.bind(messageRouter);
    (messageRouter as any).register = (_type: string, h: any) => {
      handler = h;
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as any;

    fetchProxyModule.init();
    const result = await handler({ url: 'https://example.com' });

    expect(result).toEqual({ success: true, data: { ok: true }, status: 200 });

    globalThis.fetch = originalFetch;
    (messageRouter as any).register = originalRegister;
  });

  test('handles text response', async () => {
    let handler: any;
    const originalRegister = messageRouter.register.bind(messageRouter);
    (messageRouter as any).register = (_type: string, h: any) => {
      handler = h;
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response('hello', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });
    }) as any;

    fetchProxyModule.init();
    const result = await handler({ url: 'https://example.com' });

    expect(result).toEqual({ success: true, data: 'hello', status: 200 });

    globalThis.fetch = originalFetch;
    (messageRouter as any).register = originalRegister;
  });

  test('returns structured error for non-ok responses (prefers JSON message)', async () => {
    let handler: any;
    const originalRegister = messageRouter.register.bind(messageRouter);
    (messageRouter as any).register = (_type: string, h: any) => {
      handler = h;
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ message: 'Bad Request' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
      });
    }) as any;

    fetchProxyModule.init();
    const result = await handler({ url: 'https://example.com' });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toBe('Bad Request');

    globalThis.fetch = originalFetch;
    (messageRouter as any).register = originalRegister;
  });

  test('aborts and returns timeout error', async () => {
    let handler: any;
    const originalRegister = messageRouter.register.bind(messageRouter);
    (messageRouter as any).register = (_type: string, h: any) => {
      handler = h;
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((_: any, init?: RequestInit) => {
      const signal = init?.signal;
      return new Promise((_resolve, reject) => {
        if (signal?.aborted) {
          const error = new Error('Aborted');
          (error as any).name = 'AbortError';
          reject(error);
          return;
        }
        signal?.addEventListener('abort', () => {
          const error = new Error('Aborted');
          (error as any).name = 'AbortError';
          reject(error);
        });
      });
    }) as any;

    fetchProxyModule.init();

    const resultPromise = handler({ url: 'https://example.com', timeout: 1 });
    await flushMicrotasks();
    const result = await resultPromise;

    expect(result).toEqual({ success: false, error: 'Request timeout' });

    globalThis.fetch = originalFetch;
    (messageRouter as any).register = originalRegister;
  });

  test('sends JSON body for non-GET requests', async () => {
    let handler: any;
    const originalRegister = messageRouter.register.bind(messageRouter);
    (messageRouter as any).register = (_type: string, h: any) => {
      handler = h;
    };

    const originalFetch = globalThis.fetch;
    let lastInit: RequestInit | undefined;
    globalThis.fetch = (async (_url: any, init?: RequestInit) => {
      lastInit = init;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as any;

    fetchProxyModule.init();
    await handler({
      url: 'https://example.com',
      method: 'POST',
      headers: { 'X-Test': '1' },
      body: { a: 1 },
    });

    expect(lastInit?.method).toBe('POST');
    expect((lastInit?.headers as any)['Content-Type']).toBe('application/json');
    expect((lastInit?.headers as any)['X-Test']).toBe('1');
    expect(lastInit?.body).toBe(JSON.stringify({ a: 1 }));

    globalThis.fetch = originalFetch;
    (messageRouter as any).register = originalRegister;
  });
});
