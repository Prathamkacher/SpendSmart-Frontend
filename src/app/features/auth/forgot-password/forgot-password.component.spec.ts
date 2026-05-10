import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['requestPasswordReset', 'verifyResetOtp', 'resetPassword']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not request OTP if email is invalid', () => {
    component.emailCtrl.setValue('invalid-email');
    component.requestOtp();
    expect(authServiceSpy.requestPasswordReset).not.toHaveBeenCalled();
    expect(component.emailForm.touched).toBeTrue();
  });

  it('should request OTP and advance to step 2 on success', () => {
    component.emailCtrl.setValue('test@example.com');
    authServiceSpy.requestPasswordReset.and.returnValue(of({ success: true, message: '', timestamp: '', data: null as any }));
    
    component.requestOtp();
    
    expect(authServiceSpy.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(component.step()).toBe(2);
    expect(component.email()).toBe('test@example.com');
    expect(component.successMessage()).toBe('OTP has been sent to your email.');
  });

  it('should handle request OTP error', () => {
    component.emailCtrl.setValue('test@example.com');
    authServiceSpy.requestPasswordReset.and.returnValue(throwError(() => ({ error: { message: 'User not found' } })));
    
    component.requestOtp();
    
    expect(component.step()).toBe(1);
    expect(component.errorMessage()).toBe('User not found');
  });

  it('should not verify OTP if invalid', () => {
    component.otpCtrl.setValue('123'); // < 6 digits
    component.verifyOtp();
    expect(authServiceSpy.verifyResetOtp).not.toHaveBeenCalled();
  });

  it('should verify OTP and advance to step 3 on success', () => {
    component.email.set('test@example.com');
    component.otpCtrl.setValue('123456');
    authServiceSpy.verifyResetOtp.and.returnValue(of({ success: true, message: '', timestamp: '', data: null as any }));
    
    component.verifyOtp();
    
    expect(authServiceSpy.verifyResetOtp).toHaveBeenCalledWith('test@example.com', '123456');
    expect(component.step()).toBe(3);
    expect(component.otp()).toBe('123456');
  });

  it('should handle verify OTP error', () => {
    component.email.set('test@example.com');
    component.otpCtrl.setValue('123456');
    authServiceSpy.verifyResetOtp.and.returnValue(throwError(() => ({ error: { message: 'Invalid OTP' } })));
    
    component.verifyOtp();
    
    expect(component.errorMessage()).toBe('Invalid OTP');
  });

  it('should not reset password if invalid', () => {
    component.passwordCtrl.setValue('short');
    component.resetPassword();
    expect(authServiceSpy.resetPassword).not.toHaveBeenCalled();
  });

  it('should reset password and redirect to login after timeout', fakeAsync(() => {
    component.email.set('test@example.com');
    component.otp.set('123456');
    component.passwordCtrl.setValue('password123');
    authServiceSpy.resetPassword.and.returnValue(of({ success: true, message: '', timestamp: '', data: null as any }));
    
    component.resetPassword();
    
    expect(authServiceSpy.resetPassword).toHaveBeenCalledWith('test@example.com', '123456', 'password123');
    expect(component.successMessage()).toContain('successfully');
    
    tick(2000);
    
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should handle reset password error', () => {
    component.email.set('test@example.com');
    component.otp.set('123456');
    component.passwordCtrl.setValue('password123');
    authServiceSpy.resetPassword.and.returnValue(throwError(() => ({ error: { message: 'Failed to reset' } })));
    
    component.resetPassword();
    
    expect(component.errorMessage()).toBe('Failed to reset');
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBeFalse();
    component.togglePassword();
    expect(component.showPassword()).toBeTrue();
  });
});
