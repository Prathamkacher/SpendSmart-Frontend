import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { premiumGuard } from './premium.guard';
import { AuthService } from '../services/auth.service';
import { mockUser } from '../../../testing/test-helpers';

describe('premiumGuard', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  });

  it('allows trial and pro users', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({ ...mockUser, planType: 'TRIAL' }).asReadonly()
          }
        }
      ]
    });

    expect(
      TestBed.runInInjectionContext(() =>
        premiumGuard({} as any, { url: '/analytics' } as any)
      )
    ).toBeTrue();
  });

  it('redirects free users to pricing', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(mockUser).asReadonly()
          }
        }
      ]
    });

    expect(
      TestBed.runInInjectionContext(() =>
        premiumGuard({} as any, { url: '/analytics' } as any)
      )
    ).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/pricing'], {
      queryParams: { returnUrl: '/analytics' }
    });
  });
});
