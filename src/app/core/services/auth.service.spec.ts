import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { createApiResponse, createAuthResponse, createJwtToken, mockUser } from '../../../testing/test-helpers';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success']);
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toast }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('logs in, persists the session, and navigates to the dashboard', () => {
    let responseMessage = '';

    service.login({ email: 'alex@example.com', password: 'Password@1' }).subscribe(res => {
      responseMessage = res.message;
    });

    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(createApiResponse(createAuthResponse(), { message: 'Logged in' }));

    expect(responseMessage).toBe('Logged in');
    expect(service.currentUser()).toEqual(mockUser);
    expect(service.isLoggedIn()).toBeTrue();
    expect(localStorage.getItem('accessToken')).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(service.isLoading()).toBeFalse();
  });

  it('navigates admins to the admin page after registration', () => {
    service.register({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'Password@1',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/auth/register');
    req.flush(
      createApiResponse(
        createAuthResponse({
          user: { ...mockUser, role: 'ADMIN' }
        })
      )
    );

    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('clears the loading state and rethrows login errors', () => {
    let capturedStatus = 0;

    service.login({ email: 'alex@example.com', password: 'bad-password' }).subscribe({
      error: err => {
        capturedStatus = err.status;
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(capturedStatus).toBe(401);
    expect(service.isLoading()).toBeFalse();
  });

  it('refreshes the token and updates storage', () => {
    localStorage.setItem('refreshToken', 'refresh-token');

    service.refreshToken().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/auth/refresh');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-token' });
    req.flush(
      createApiResponse(
        createAuthResponse({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token'
        })
      )
    );

    expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
  });

  it('clears the session immediately on logout', () => {
    service.setSession(createAuthResponse());

    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('detects valid and invalid JWTs', () => {
    localStorage.setItem(
      'accessToken',
      createJwtToken(Math.floor(Date.now() / 1000) + 120)
    );
    expect(service.hasValidToken()).toBeTrue();

    localStorage.setItem(
      'accessToken',
      createJwtToken(Math.floor(Date.now() / 1000) - 120)
    );
    expect(service.hasValidToken()).toBeFalse();

    localStorage.setItem('accessToken', 'bad-token');
    expect(service.hasValidToken()).toBeFalse();
  });
});
