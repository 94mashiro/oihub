import { describe, expect, test } from 'bun:test';
import { cn } from './utils';

describe('cn', () => {
  test('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  test('handles conditional classes', () => {
    const includeBar = false;
    expect(cn('foo', includeBar && 'bar', 'baz')).toBe('foo baz');
  });

  test('handles Tailwind conflicts - later wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  test('handles empty inputs', () => {
    expect(cn()).toBe('');
  });

  test('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});
