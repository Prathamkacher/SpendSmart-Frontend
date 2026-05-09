import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard, authGuard, noAuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('auth guards', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
      'hasValidToken',
      'isAdmin'
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('allows authenticated users through authGuard', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.hasValidToken.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users to login', () => {
    authService.isLoggedIn.and.returnValue(false);
    authService.hasValidToken.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('redirects authenticated users away from public auth pages', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.hasValidToken.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('allows admins and redirects non-admins from adminGuard', () => {
    authService.isAdmin.and.returnValue(true);
    expect(TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any))).toBeTrue();

    authService.isAdmin.and.returnValue(false);
    expect(TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any))).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
