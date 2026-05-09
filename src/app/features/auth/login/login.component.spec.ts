import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let queryParams$: Subject<Record<string, string>>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    queryParams$ = new Subject<Record<string, string>>();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
        {
          provide: ThemeService,
          useValue: {
            isDark: signal(false).asReadonly(),
            toggleTheme: jasmine.createSpy('toggleTheme')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('reads feedback flags from the query string', () => {
    queryParams$.next({ logout: 'success' });
    expect(component.successMessage()).toBe('You have been logged out successfully.');

    queryParams$.next({ error: 'oauth_failed' });
    expect(component.errorMessage()).toBe('Social login failed. Please try again.');
  });

  it('marks invalid forms as touched instead of submitting', () => {
    component.onSubmit();

    expect(component.loginForm.touched).toBeTrue();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('submits normalized credentials and shows backend errors', () => {
    authService.login.and.returnValue(
      throwError(() => ({
        error: { data: { email: 'Account not found' } }
      }))
    );
    component.loginForm.setValue({
      email: 'ALEX@EXAMPLE.COM',
      password: 'Password@1'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'alex@example.com',
      password: 'Password@1'
    });
    expect(component.isSubmitting()).toBeFalse();
    expect(component.errorMessage()).toBe('Account not found');
  });

  it('toggles password visibility', () => {
    expect(component.showPassword()).toBeFalse();
    component.togglePassword();
    expect(component.showPassword()).toBeTrue();
  });
});
