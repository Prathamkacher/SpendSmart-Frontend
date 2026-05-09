// src/app/features/auth/register/register.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder,
  FormGroup, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.models';
import { environment } from '../../../../environments/environment';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import {
  EMAIL_REGEX,
  FULL_NAME_REGEX,
  REGISTER_PASSWORD_REGEX,
  extractApiErrorMessage,
  normalizeFullName,
  passwordMatchValidator
} from '../../../shared/utils/auth-form.utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  private readonly oauthBaseUrl = environment.authApiUrl;

  registerForm: FormGroup;
  errorMessage   = signal<string>('');
  showPassword   = signal<boolean>(false);
  showConfirm    = signal<boolean>(false);
  isSubmitting   = signal<boolean>(false);
  currentStep    = signal<number>(1);   // 2-step form
  activeDocument = signal<'terms' | 'privacy' | null>(null);

  // Password strength signals
  passwordStrength = signal<number>(0);   // 0-4
  strengthLabel    = signal<string>('');

  readonly CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(FULL_NAME_REGEX)]],
      email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
      password:        ['', [
        Validators.required,
        Validators.pattern(REGISTER_PASSWORD_REGEX)
      ]],
      confirmPassword: ['', Validators.required],
      currency:        ['INR'],
      timezone:        ['Asia/Kolkata'],
      agreeToTerms:    [false, Validators.requiredTrue]
    }, { validators: passwordMatchValidator });

    // Update password strength meter on change
    this.registerForm.get('password')!.valueChanges.subscribe(val => {
      this.updateStrength(val);
    });
  }

  // Convenience getters
  get fullName()        { return this.registerForm.get('fullName')!;        }
  get email()           { return this.registerForm.get('email')!;           }
  get password()        { return this.registerForm.get('password')!;        }
  get confirmPassword() { return this.registerForm.get('confirmPassword')!; }
  get agreeToTerms()    { return this.registerForm.get('agreeToTerms')!;    }

  get passwordsMatch(): boolean {
    return !this.registerForm.errors?.['passwordMismatch']
        || this.confirmPassword.pristine;
  }

  goToStep2(): void {
    const step1Controls = ['fullName', 'email'];
    step1Controls.forEach(c => this.registerForm.get(c)!.markAsTouched());
    const step1Valid = step1Controls.every(c => this.registerForm.get(c)!.valid);
    if (step1Valid) this.currentStep.set(2);
  }

  goBack(): void {
    this.currentStep.set(1);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const request: RegisterRequest = {
      fullName: normalizeFullName(this.fullName.value),
      email: this.email.value.trim().toLowerCase(),
      password: this.password.value,
      currency: this.registerForm.get('currency')!.value,
      timezone: this.registerForm.get('timezone')!.value
    };

    this.authService.register(request).subscribe({
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(err, 'Registration failed. Please try again.')
        );
      }
    });
  }

  private updateStrength(password: string): void {
    if (!password) { this.passwordStrength.set(0); this.strengthLabel.set(''); return; }

    let score = 0;
    if (password.length >= 8)               score++;
    if (password.length >= 12)              score++;
    if (/[A-Z]/.test(password))             score++;
    if (/[0-9]/.test(password))             score++;
    if (/[^A-Za-z0-9]/.test(password))      score++;

    this.passwordStrength.set(Math.min(score, 4));
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    this.strengthLabel.set(labels[Math.min(score, 4)]);
  }

  getStrengthColor(): string {
    const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
    return colors[this.passwordStrength()] || '';
  }

  getStrengthTextColor(): string {
    const colors = ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-600'];
    return colors[this.passwordStrength()] || '';
  }

  registerWithGoogle(): void {
    window.location.href = `${this.oauthBaseUrl}/oauth2/authorization/google`;
  }

  registerWithGitHub(): void {
    window.location.href = `${this.oauthBaseUrl}/oauth2/authorization/github`;
  }

  openDocument(type: 'terms' | 'privacy'): void {
    this.activeDocument.set(type);
  }

  closeDocument(): void {
    this.activeDocument.set(null);
  }

  get documentTitle(): string {
    return this.activeDocument() === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  }

  get documentContent(): string[] {
    if (this.activeDocument() === 'privacy') {
      return [
        'We collect the information you enter during registration, including your name, email, selected currency, and account preferences.',
        'Your data is used to create and secure your account, personalize your finance dashboard, and support features such as reports, reminders, and account recovery.',
        'We do not sell your personal information. Data may be shared only with trusted infrastructure and service providers required to operate the platform securely.',
        'You can request profile updates or account deactivation from within your account settings. Security logs and limited backup records may be retained where necessary.'
      ];
    }

    return [
      'By creating an account, you agree to provide accurate information and keep your login credentials secure.',
      'SpendSmart is intended to help you track budgets, income, expenses, and financial goals. You are responsible for reviewing your entries and reports before relying on them.',
      'You agree not to misuse the platform, interfere with service availability, attempt unauthorized access, or submit false or harmful data.',
      'We may update features, security rules, or these terms when needed. Continued use of the service after such updates means you accept the revised terms.'
    ];
  }
}
