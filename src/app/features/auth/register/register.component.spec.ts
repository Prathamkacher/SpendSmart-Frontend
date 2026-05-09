import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
    authService.register.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: ThemeService,
          useValue: {
            isDark: signal(false).asReadonly(),
            toggleTheme: jasmine.createSpy('toggleTheme')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm(): void {
    component.registerForm.patchValue({
      fullName: 'Alex Spend',
      email: 'ALEX@EXAMPLE.COM',
      password: 'Password@1',
      confirmPassword: 'Password@1',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      agreeToTerms: true
    });
  }

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('moves to step 2 only when step 1 is valid', () => {
    component.goToStep2();
    expect(component.currentStep()).toBe(1);

    component.registerForm.patchValue({
      fullName: 'Alex Spend',
      email: 'alex@example.com'
    });
    component.goToStep2();
    expect(component.currentStep()).toBe(2);
  });

  it('updates the password strength indicators', () => {
    component.password.setValue('Password@1');
    expect(component.passwordStrength()).toBe(4);
    expect(component.strengthLabel()).toBe('Strong');
  });

  it('opens and closes modal documents', () => {
    component.openDocument('privacy');
    expect(component.activeDocument()).toBe('privacy');
    expect(component.documentTitle).toBe('Privacy Policy');

    component.closeDocument();
    expect(component.activeDocument()).toBeNull();
  });

  it('submits normalized registration details', () => {
    fillValidForm();
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Alex Spend',
      email: 'alex@example.com',
      password: 'Password@1',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    });
  });

  it('surfaces backend validation errors', () => {
    authService.register.and.returnValue(
      throwError(() => ({ error: { message: 'Email already exists' } }))
    );
    fillValidForm();

    component.onSubmit();

    expect(authService.register).toHaveBeenCalled();
    expect(component.isSubmitting()).toBeFalse();
    expect(component.errorMessage()).toBe('Email already exists');
  });
});
