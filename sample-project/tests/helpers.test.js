const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isNonEmptyString, truncate } = require('../src/utils/helpers');

describe('Helpers', () => {
  it('isNonEmptyString returns true for a non-empty string', () => {
    assert.strictEqual(isNonEmptyString('hello'), true);
  });

  it('isNonEmptyString returns false for an empty string', () => {
    assert.strictEqual(isNonEmptyString(''), false);
  });

  it('isNonEmptyString returns false for a whitespace-only string', () => {
    assert.strictEqual(isNonEmptyString('   '), false);
  });

  it('isNonEmptyString returns false for a non-string value', () => {
    assert.strictEqual(isNonEmptyString(42), false);
  });

  it('truncate shortens a string that exceeds maxLen', () => {
    const result = truncate('Hello World', 5);
    assert.strictEqual(result, 'Hello...');
  });

  it('truncate returns the original string when within maxLen', () => {
    const result = truncate('Hi', 10);
    assert.strictEqual(result, 'Hi');
  });

  it('truncate returns empty string for a falsy input', () => {
    assert.strictEqual(truncate(null, 10), '');
    assert.strictEqual(truncate('', 10), '');
  });

  // formatPrice is not tested here — it throws on non-numeric input
  // which is a known issue (missing error handling) flagged by DevFlow Code Health analysis
});
