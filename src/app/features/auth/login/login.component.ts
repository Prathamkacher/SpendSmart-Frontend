// src/app/features/auth/login/login.component.ts
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder,
  FormGroup, Validators
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.models';
import { environment } from '../../../../environments/environment';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import {
  EMAIL_REGEX,
  LOGIN_PASSWORD_REGEX,
  extractApiErrorMessage
} from '../../../shared/utils/auth-form.utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  private readonly oauthBaseUrl = environment.authApiUrl;

  loginForm: FormGroup;
  errorMessage  = signal<string>('');
  successMessage = signal<string>('');
  showPassword  = signal<boolean>(false);
  isSubmitting  = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
    ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
      password: ['', [Validators.required, Validators.pattern(LOGIN_PASSWORD_REGEX)]]
    });
  }

  ngOnInit(): void {
    // Check for errors in URL (e.g. from OAuth failure)
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'oauth_failed') {
        this.errorMessage.set('Social login failed. Please try again.');
      } else if (params['error'] === 'account_deactivated') {
        this.errorMessage.set('This account has been deactivated.');
      } else if (params['logout'] === 'success') {
        this.successMessage.set('You have been logged out successfully.');
      }
    });
  }

  get email()    { return this.loginForm.get('email')!;    }
  get password() { return this.loginForm.get('password')!; }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const request: LoginRequest = {
      email: this.email.value.trim().toLowerCase(),
      password: this.password.value
    };

    this.authService.login(request).subscribe({
      next: () => {
        // Auth service handles navigation on success
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(
            err,
            'Login failed. Please check your credentials.'
          )
        );
      }
    });
  }

  loginWithGoogle(): void {
    window.location.href = `${this.oauthBaseUrl}/oauth2/authorization/google`;
  }

  loginWithGitHub(): void {
    window.location.href = `${this.oauthBaseUrl}/oauth2/authorization/github`;
  }
}
