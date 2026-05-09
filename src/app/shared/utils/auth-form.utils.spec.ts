import { FormControl, FormGroup } from '@angular/forms';
import {
  EMAIL_REGEX,
  FULL_NAME_REGEX,
  LOGIN_PASSWORD_REGEX,
  REGISTER_PASSWORD_REGEX,
  extractApiErrorMessage,
  normalizeFullName,
  passwordMatchValidator
} from './auth-form.utils';

describe('auth-form.utils', () => {
  it('validates the exported auth regexes against representative values', () => {
    expect(FULL_NAME_REGEX.test('Alex Spend')).toBeTrue();
    expect(FULL_NAME_REGEX.test('Alex  Spend')).toBeFalse();

    expect(EMAIL_REGEX.test('alex.spend@example.com')).toBeTrue();
    expect(EMAIL_REGEX.test('alex@@example.com')).toBeFalse();

    expect(LOGIN_PASSWORD_REGEX.test('Password1!')).toBeTrue();
    expect(LOGIN_PASSWORD_REGEX.test('short')).toBeFalse();

    expect(REGISTER_PASSWORD_REGEX.test('Secure@123')).toBeTrue();
    expect(REGISTER_PASSWORD_REGEX.test('nocaps123!')).toBeFalse();
  });

  it('detects password mismatch and matching passwords', () => {
    const mismatchGroup = new FormGroup({
      password: new FormControl('Secure@123'),
      confirmPassword: new FormControl('Wrong@123')
    });
    const matchingGroup = new FormGroup({
      password: new FormControl('Secure@123'),
      confirmPassword: new FormControl('Secure@123')
    });

    expect(passwordMatchValidator(mismatchGroup)).toEqual({ passwordMismatch: true });
    expect(passwordMatchValidator(matchingGroup)).toBeNull();
  });

  it('normalizes full names and extracts the best available api error message', () => {
    expect(normalizeFullName('  Alex   Spend  ')).toBe('Alex Spend');

    expect(
      extractApiErrorMessage(
        { error: { data: { email: 'Email already exists' }, message: 'Fallback message' } },
        'Default'
      )
    ).toBe('Email already exists');

    expect(
      extractApiErrorMessage(
        { error: { data: { email: '   ' }, message: 'Backend message' } },
        'Default'
      )
    ).toBe('Backend message');

    expect(extractApiErrorMessage({}, 'Default')).toBe('Default');
  });
});
