import { describe, expect, test } from 'bun:test';
import { moduleRegistry } from './module-registry';

describe('moduleRegistry', () => {
  test('initializes modules in order and cleans up in reverse order', () => {
    (moduleRegistry as any).cleanups = [];

    const initOrder: string[] = [];
    const cleanupOrder: string[] = [];

    const modules = [
      {
        name: 'm1',
        init: () => {
          initOrder.push('m1');
          return () => cleanupOrder.push('m1');
        },
      },
      {
        name: 'm2',
        init: () => {
          initOrder.push('m2');
          return () => cleanupOrder.push('m2');
        },
      },
      {
        name: 'm3',
        init: () => {
          initOrder.push('m3');
          return () => cleanupOrder.push('m3');
        },
      },
    ];

    const cleanup = moduleRegistry.initAll(modules as any);

    expect(initOrder).toEqual(['m1', 'm2', 'm3']);
    cleanup();
    expect(cleanupOrder).toEqual(['m3', 'm2', 'm1']);
  });

  test('cleanup can be called multiple times and allows re-init', () => {
    (moduleRegistry as any).cleanups = [];

    const calls: string[] = [];
    const mod = {
      name: 'm',
      init: () => {
        calls.push('init');
        return () => calls.push('cleanup');
      },
    };

    const cleanup1 = moduleRegistry.initAll([mod] as any);
    cleanup1();
    cleanup1();

    const cleanup2 = moduleRegistry.initAll([mod] as any);
    cleanup2();

    expect(calls).toEqual(['init', 'cleanup', 'init', 'cleanup']);
  });
});
