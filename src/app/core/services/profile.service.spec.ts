import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { AuthService } from './auth.service';
import { UserProfile } from '../models/auth.models';
import { environment } from '../../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  
  const mockUser: UserProfile = {
    userId: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    currency: 'USD',
    timezone: 'UTC',
    avatarUrl: 'http://example.com/avatar.jpg',
    provider: 'LOCAL',
    role: 'USER',
    isActive: true,
    monthlyBudget: 1000,
    planType: 'FREE',
    planStartDate: null,
    planExpiryDate: null,
    isTrialUsed: false,
    createdAt: '2026-01-01T00:00:00Z'
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['updateCurrentUser']);
    Object.defineProperty(spy, 'currentUserValue', { get: () => mockUser });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProfileService,
        { provide: AuthService, useValue: spy }
      ]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch profile', () => {
    service.getProfile().subscribe(res => {
      expect(res.data.fullName).toBe('John Doe');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockUser });
  });

  it('should update profile and notify auth service', () => {
    const updateData = { fullName: 'Jane Doe', avatarUrl: 'new.jpg' };
    const responseData = { ...mockUser, ...updateData };
    
    service.updateProfile(updateData).subscribe(res => {
      expect(res.success).toBeTrue();
      expect(authServiceSpy.updateCurrentUser).toHaveBeenCalledWith({
        ...mockUser,
        fullName: 'Jane Doe',
        avatarUrl: 'new.jpg'
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush({ success: true, data: responseData });
  });

  it('should not update auth service if update fails', () => {
    const updateData = { fullName: 'Jane Doe' };
    
    service.updateProfile(updateData).subscribe(res => {
      expect(res.success).toBeFalse();
      expect(authServiceSpy.updateCurrentUser).not.toHaveBeenCalled();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
    req.flush({ success: false, data: null });
  });
});
