import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { createApiResponse, mockUser } from '../../../testing/test-helpers';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<any>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['updateCurrentUser'], {
      currentUserValue: mockUser
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    });

    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches the current profile', () => {
    service.getProfile().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/auth/profile');
    expect(req.request.method).toBe('GET');
    req.flush(createApiResponse(mockUser));
  });

  it('updates the current auth user when profile update succeeds', () => {
    const updatedUser = {
      ...mockUser,
      fullName: 'Updated Name',
      avatarUrl: 'https://example.com/avatar.png'
    };

    service.updateProfile({ fullName: updatedUser.fullName }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/auth/profile');
    expect(req.request.method).toBe('PUT');
    req.flush(createApiResponse(updatedUser));

    expect(authServiceSpy.updateCurrentUser).toHaveBeenCalledWith({
      ...mockUser,
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatarUrl
    });
  });

  it('does not update auth state when the backend reports failure', () => {
    service.updateProfile({ bio: 'New bio' }).subscribe();

    httpMock
      .expectOne('http://localhost:8080/auth/profile')
      .flush(createApiResponse({ ...mockUser }, { success: false }));

    expect(authServiceSpy.updateCurrentUser).not.toHaveBeenCalled();
  });
});
