import { createViewerToken, deriveToken, readViewerToken, tokensMatch } from '@/lib/auth';

describe('Caelum authentication tokens', () => {
  it('derives stable tokens without exposing the passcode', async () => {
    const token = await deriveToken('test-passcode');
    expect(token).toBe(await deriveToken('test-passcode'));
    expect(token).not.toContain('test-passcode');
    expect(token).not.toBe(await deriveToken('another-passcode'));
  });

  it('accepts a signed identity and rejects altered identities and secrets', async () => {
    const token = await createViewerToken('member-id', 'test-secret');
    expect(await readViewerToken(token, 'test-secret')).toBe('member-id');
    expect(await readViewerToken(token.replace('member-id', 'other-id'), 'test-secret')).toBeNull();
    expect(await readViewerToken(token, 'other-secret')).toBeNull();
    expect(await readViewerToken('invalid', 'test-secret')).toBeNull();
  });

  it('compares complete tokens', () => {
    expect(tokensMatch('abc', 'abc')).toBe(true);
    expect(tokensMatch('abc', 'abd')).toBe(false);
    expect(tokensMatch('abc', 'abcd')).toBe(false);
  });
});