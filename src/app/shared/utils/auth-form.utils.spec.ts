import { passwordMatchValidator, normalizeFullName, extractApiErrorMessage, FULL_NAME_REGEX, EMAIL_REGEX } from './auth-form.utils';
import { FormControl, FormGroup } from '@angular/forms';

describe('AuthFormUtils', () => {
  it('should validate password match', () => {
    const form = new FormGroup({
      password: new FormControl('pass1'),
      confirmPassword: new FormControl('pass2')
    });

    const result = passwordMatchValidator(form);
    expect(result).toEqual({ passwordMismatch: true });

    form.get('confirmPassword')?.setValue('pass1');
    const result2 = passwordMatchValidator(form);
    expect(result2).toBeNull();
  });

  it('should normalize full name', () => {
    expect(normalizeFullName('  John   Doe  ')).toBe('John Doe');
  });

  it('should extract API error message', () => {
    const err1 = { error: { message: 'Direct message' } };
    expect(extractApiErrorMessage(err1, 'Fallback')).toBe('Direct message');

    const err2 = { error: { data: { field1: 'Validation error' } } };
    expect(extractApiErrorMessage(err2, 'Fallback')).toBe('Validation error');

    const err3 = {};
    expect(extractApiErrorMessage(err3, 'Fallback')).toBe('Fallback');
  });

  it('should validate full name regex', () => {
    expect(FULL_NAME_REGEX.test('John Doe')).toBeTrue();
    expect(FULL_NAME_REGEX.test('John  Doe')).toBeFalse();
  });

  it('should validate email regex', () => {
    expect(EMAIL_REGEX.test('test@example.com')).toBeTrue();
    expect(EMAIL_REGEX.test('invalid-email')).toBeFalse();
  });
});
