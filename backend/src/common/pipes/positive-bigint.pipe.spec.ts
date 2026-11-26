import { describe, it, expect } from 'vitest';
import { PositiveBigintPipe } from './positive-bigint.pipe.js';

describe('PositiveBigintPipe', () => {
  it('returns a number with the same precision as in PostgreSQL', () => {
    const pipe = new PositiveBigintPipe();

    expect(pipe.transform('9223372036854775807')).toBe('9223372036854775807');
  });
});
