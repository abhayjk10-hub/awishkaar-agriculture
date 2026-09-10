import test from 'node:test';
import assert from 'node:assert/strict';

import { generateOtpCode, verifyOtpCode } from './otp';

test('generateOtpCode creates a six-digit code', () => {
  const code = generateOtpCode();
  assert.equal(code.length, 6);
  assert.match(code, /^\d{6}$/);
});

test('verifyOtpCode accepts a matching valid code and rejects expired or wrong values', () => {
  const code = '123456';
  assert.equal(verifyOtpCode('9999999999', code, Date.now() + 60000, code), true);
  assert.equal(verifyOtpCode('9999999999', '654321', Date.now() + 60000, code), false);
  assert.equal(verifyOtpCode('9999999999', code, Date.now() - 60000, code), false);
});
