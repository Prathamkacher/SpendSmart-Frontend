import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockUser = {
    userId: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    currency: 'USD',
    avatarUrl: 'http://example.com/avatar.jpg',
    bio: 'Software Engineer',
    monthlyBudget: 2000,
    timezone: 'UTC',
    provider: 'local',
    role: 'USER',
    isActive: true
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['updateProfile']);
    // Mock the currentUser signal
    Object.defineProperty(authServiceSpy, 'currentUser', { get: () => signal(mockUser) });
    
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['getUnreadCount']); // just a spy if needed

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.profileForm).toBeDefined();
    expect(component.profileForm.get('fullName')?.value).toBe('John Doe');
    expect(component.profileForm.get('email')?.value).toBe('john@example.com');
    expect(component.profileForm.get('email')?.disabled).toBeTrue();
    expect(component.previewUrl).toBe('http://example.com/avatar.jpg');
  });

  it('should trigger file input', () => {
    const input = document.createElement('input');
    spyOn(input, 'click');
    component.triggerFileInput(input);
    expect(input.click).toHaveBeenCalled();
  });

  it('should handle file selection', fakeAsync(() => {
    const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };
    const readAsDataUrlSpy = jasmine.createSpy('readAsDataURL').and.callFake(function (this: FileReader) {
      Object.defineProperty(this, 'result', {
        configurable: true,
        value: 'data:image/jpeg;base64,avatar'
      });
      this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>);
    });
    const fileReaderMock = {
      result: null,
      onload: null as FileReader['onload'],
      readAsDataURL: readAsDataUrlSpy
    } as unknown as FileReader;
    spyOn(window as Window & typeof globalThis, 'FileReader').and.returnValue(fileReaderMock as any);

    component.onFileSelected(event);
    tick();

    expect(readAsDataUrlSpy).toHaveBeenCalledWith(file);
    expect(component.previewUrl).toBe('data:image/jpeg;base64,avatar');
    expect(component.profileForm.get('avatarUrl')?.value).toBe('data:image/jpeg;base64,avatar');
  }));

  it('should not submit if form is invalid', () => {
    component.profileForm.get('fullName')?.setValue('');
    component.onSubmit();
    expect(authServiceSpy.updateProfile).not.toHaveBeenCalled();
  });

  it('should submit form and update profile', () => {
    component.profileForm.get('fullName')?.setValue('Jane Doe');
    authServiceSpy.updateProfile.and.returnValue(of({ success: true, message: '', timestamp: '', data: null as any }));

    component.onSubmit();

    expect(component.isUpdating).toBeFalse();
    expect(authServiceSpy.updateProfile).toHaveBeenCalled();
  });

  it('should handle error during update', () => {
    component.profileForm.get('fullName')?.setValue('Jane Doe');
    authServiceSpy.updateProfile.and.returnValue(throwError(() => new Error('Update failed')));

    component.onSubmit();

    expect(component.isUpdating).toBeFalse();
  });
});
