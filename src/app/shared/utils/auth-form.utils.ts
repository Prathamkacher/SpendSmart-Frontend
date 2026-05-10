import { AbstractControl, ValidationErrors } from '@angular/forms';

export const FULL_NAME_REGEX = /^(?!.*\s{2,})[A-Za-z]+(?: [A-Za-z]+)*$/;
export const EMAIL_REGEX =
  /^[A-Za-z0-9](?:[A-Za-z0-9_%+-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9_%+-]*[A-Za-z0-9])?)*@[A-Za-z](?:[A-Za-z-]*[A-Za-z])?(?:\.[A-Za-z](?:[A-Za-z-]*[A-Za-z])?)+$/;
export const LOGIN_PASSWORD_REGEX = /^(?=\S{8,64}$).+/;
export const REGISTER_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }

  return null;
}

export function normalizeFullName(value: string): string {
  return value.trim().replaceAll(/\s+/g, ' ');
}

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  const validationErrors = (err as any)?.error?.data;

  if (validationErrors && typeof validationErrors === 'object') {
    const firstError = Object.values(validationErrors)[0];
    if (typeof firstError === 'string' && firstError.trim()) {
      return firstError;
    }
  }

  return (err as any)?.error?.message || fallback;
}
