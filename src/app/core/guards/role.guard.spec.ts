import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { signal } from '@angular/core';
import { mockUser } from '../../../testing/test-helpers';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let router: jasmine.SpyObj<Router>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toastService },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({ ...mockUser, role: 'ADMIN' }).asReadonly()
          }
        }
      ]
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('allows matching roles', () => {
    const route = new ActivatedRouteSnapshot();
    route.data = { role: 'ADMIN' };

    expect(guard.canActivate(route, {} as any)).toBeTrue();
  });

  it('rejects unauthorized roles and redirects', () => {
    TestBed.resetTestingModule();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toastService },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(mockUser).asReadonly()
          }
        }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    const route = new ActivatedRouteSnapshot();
    route.data = { role: 'ADMIN' };

    expect(guard.canActivate(route, {} as any)).toBeFalse();
    expect(toastService.error).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
