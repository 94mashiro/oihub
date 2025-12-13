import { describe, expect, test } from 'bun:test';
import { formatThousands } from './format-number';

describe('formatThousands', () => {
  test('formats integers with en-US thousands separators', () => {
    expect(formatThousands(0)).toBe('0');
    expect(formatThousands(1000)).toBe('1,000');
    expect(formatThousands(1234567)).toBe('1,234,567');
  });
});
