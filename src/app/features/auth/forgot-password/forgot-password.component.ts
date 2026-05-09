import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ThemeToggleComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Flow State
  step = signal<1 | 2 | 3>(1);
  email = signal<string>('');
  otp = signal<string>('');
  
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Forms
  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]]
  });

  otpForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  passwordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  showPassword = signal<boolean>(false);

  // Getters
  get emailCtrl() { return this.emailForm.controls.email; }
  get otpCtrl() { return this.otpForm.controls.otp; }
  get passwordCtrl() { return this.passwordForm.controls.newPassword; }

  togglePassword() {
    this.showPassword.update(s => !s);
  }

  requestOtp() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const emailValue = this.emailCtrl.value;

    this.authService.requestPasswordReset(emailValue).subscribe({
      next: () => {
        this.email.set(emailValue);
        this.step.set(2);
        this.isSubmitting.set(false);
        this.successMessage.set('OTP has been sent to your email.');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to request OTP. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const otpValue = this.otpCtrl.value;

    this.authService.verifyResetOtp(this.email(), otpValue).subscribe({
      next: () => {
        this.otp.set(otpValue);
        this.step.set(3);
        this.isSubmitting.set(false);
        this.successMessage.set('OTP verified. Please set a new password.');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Invalid or expired OTP.');
        this.isSubmitting.set(false);
      }
    });
  }

  resetPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const passwordValue = this.passwordCtrl.value;

    this.authService.resetPassword(this.email(), this.otp(), passwordValue).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to reset password.');
        this.isSubmitting.set(false);
      }
    });
  }
}
