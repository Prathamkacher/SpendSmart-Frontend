import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';
import { createApiResponse, createAuthResponse } from '../../../testing/test-helpers';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getAccessToken',
      'getRefreshToken',
      'refreshToken'
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('injects the bearer token for protected requests', () => {
    authService.getAccessToken.and.returnValue('token-123');

    http.get('/expenses').subscribe();

    const req = httpMock.expectOne('/expenses');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({});
  });

  it('skips token injection for public auth endpoints', () => {
    authService.getAccessToken.and.returnValue('token-123');

    http.post('/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('refreshes on 401 and retries the original request once', () => {
    authService.getAccessToken.and.returnValues('old-token', 'new-token');
    authService.getRefreshToken.and.returnValue('refresh-token');
    authService.refreshToken.and.returnValue(of(createApiResponse(createAuthResponse())));

    let responseBody: unknown;
    http.get('/secure').subscribe(res => {
      responseBody = res;
    });

    const initialReq = httpMock.expectOne('/secure');
    initialReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    const retriedReq = httpMock.expectOne('/secure');
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retriedReq.flush({ ok: true });

    expect(responseBody).toEqual({ ok: true });
    expect(authService.refreshToken).toHaveBeenCalled();
  });

  it('navigates to login if token refresh also fails', () => {
    authService.getAccessToken.and.returnValue('old-token');
    authService.getRefreshToken.and.returnValue('refresh-token');
    authService.refreshToken.and.returnValue(
      throwError(() => new Error('Refresh failed'))
    );

    http.get('/secure').subscribe({
      error: () => undefined
    });

    const req = httpMock.expectOne('/secure');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
