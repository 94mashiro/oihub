import { describe, expect, test } from 'bun:test';
import { flushMicrotasks, installFakeBrowser, resetFakeBrowser } from '@/lib/test/wxt-test-helpers';
import { messageRouter } from './message-router';

describe('messageRouter', () => {
  test('init registers only one onMessage listener', () => {
    installFakeBrowser();
    resetFakeBrowser();

    let addListenerCalls = 0;
    let capturedListener: any;

    const originalAddListener = browser.runtime.onMessage.addListener;
    browser.runtime.onMessage.addListener = ((listener: any) => {
      addListenerCalls++;
      capturedListener = listener;
      return originalAddListener(listener);
    }) as any;

    (messageRouter as any).initialized = false;

    messageRouter.init();
    messageRouter.init();

    expect(addListenerCalls).toBe(1);
    expect(typeof capturedListener).toBe('function');

    browser.runtime.onMessage.addListener = originalAddListener;
  });

  test('routes message to registered handler and returns true', async () => {
    installFakeBrowser();
    resetFakeBrowser();

    let capturedListener: any;
    const originalAddListener = browser.runtime.onMessage.addListener;
    browser.runtime.onMessage.addListener = ((listener: any) => {
      capturedListener = listener;
      return originalAddListener(listener);
    }) as any;

    (messageRouter as any).handlers = new Map<string, any>();
    (messageRouter as any).initialized = false;

    messageRouter.register('PING', async (payload) => {
      return { ok: true, payload };
    });
    messageRouter.init();

    let response: any;
    const returned = capturedListener({ type: 'PING', payload: { x: 1 } }, {} as any, (r: any) => {
      response = r;
    });

    expect(returned).toBe(true);
    await flushMicrotasks();
    expect(response).toEqual({ ok: true, payload: { x: 1 } });

    browser.runtime.onMessage.addListener = originalAddListener;
  });

  test('returns false when no handler is registered', () => {
    installFakeBrowser();
    resetFakeBrowser();

    let capturedListener: any;
    const originalAddListener = browser.runtime.onMessage.addListener;
    browser.runtime.onMessage.addListener = ((listener: any) => {
      capturedListener = listener;
      return originalAddListener(listener);
    }) as any;

    (messageRouter as any).handlers = new Map<string, any>();
    (messageRouter as any).initialized = false;

    messageRouter.init();
    const returned = capturedListener({ type: 'MISSING', payload: null }, {} as any, () => {});
    expect(returned).toBe(false);

    browser.runtime.onMessage.addListener = originalAddListener;
  });

  test('sends error response when handler rejects', async () => {
    installFakeBrowser();
    resetFakeBrowser();

    let capturedListener: any;
    const originalAddListener = browser.runtime.onMessage.addListener;
    browser.runtime.onMessage.addListener = ((listener: any) => {
      capturedListener = listener;
      return originalAddListener(listener);
    }) as any;

    (messageRouter as any).handlers = new Map<string, any>();
    (messageRouter as any).initialized = false;

    messageRouter.register('FAIL', async () => {
      throw new Error('boom');
    });
    messageRouter.init();

    let response: any;
    capturedListener({ type: 'FAIL', payload: null }, {} as any, (r: any) => {
      response = r;
    });

    await flushMicrotasks();
    expect(response).toEqual({ success: false, error: 'boom' });

    browser.runtime.onMessage.addListener = originalAddListener;
  });
});
