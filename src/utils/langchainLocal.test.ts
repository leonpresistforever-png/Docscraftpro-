import { describe, it, expect } from 'vitest';
import { compactPromptForLocal } from './langchainLocal';

describe('compactPromptForLocal', () => {
  it('returns an empty string if input is empty', () => {
    expect(compactPromptForLocal('')).toBe('');
    expect(compactPromptForLocal(null as any)).toBe('');
    expect(compactPromptForLocal(undefined as any)).toBe('');
  });

  it('trims leading and trailing whitespace but leaves short content intact', () => {
    expect(compactPromptForLocal('   hello world   ')).toBe('hello world');
    expect(compactPromptForLocal('\n\n  test\n  ')).toBe('test');
  });

  it('leaves a string exactly 4000 characters intact (after trimming)', () => {
    const input = 'a'.repeat(4000);
    expect(compactPromptForLocal(`  ${input}  `)).toBe(input);
  });

  it('truncates a string > 4000 characters and appends the warning message', () => {
    const input = 'a'.repeat(4001);
    const expected = 'a'.repeat(4000) + '...\n[Content truncated for WebGPU model performance]';
    expect(compactPromptForLocal(input)).toBe(expected);
  });
});
