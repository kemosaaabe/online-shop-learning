import { describe, it, expect } from 'vitest';
import { BadRequestException, type ArgumentMetadata } from '@nestjs/common';
import { PositiveIntPipe } from './positive-int.pipe.js';

describe('PositiveIntPipe', () => {
  let pipe: PositiveIntPipe;
  const metadata: ArgumentMetadata = { type: 'param' };

  beforeEach(() => {
    pipe = new PositiveIntPipe();
  });

  it('should return positive number from string', async () => {
    const result = await pipe.transform('42', metadata);

    expect(result).toBe(42);
  });

  it('should throw bad request error on zero value', async () => {
    await expect(pipe.transform('0', metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
