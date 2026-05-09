import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PricingComponent } from './pricing.component';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { createApiResponse, mockUser } from '../../../../testing/test-helpers';

describe('PricingComponent', () => {
  let fixture: ComponentFixture<PricingComponent>;
  let component: PricingComponent;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let subscriptionService: jasmine.SpyObj<SubscriptionService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getProfile'], {
      currentUser: signal(mockUser).asReadonly()
    });
    subscriptionService = jasmine.createSpyObj<SubscriptionService>('SubscriptionService', [
      'startTrial',
      'createOrder',
      'verifyPayment'
    ]);

    authService.getProfile.and.returnValue(of(createApiResponse(mockUser)));
    subscriptionService.startTrial.and.returnValue(of(createApiResponse(void 0)));
    subscriptionService.createOrder.and.returnValue(
      of({ id: 'order_1', amount: 999, currency: 'INR', keyId: 'rzp_key' })
    );
    subscriptionService.verifyPayment.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [PricingComponent, RouterTestingModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        { provide: SubscriptionService, useValue: subscriptionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes pricing state from the current user', () => {
    expect(component.currentPlan).toBe('FREE');
    expect(component.userId).toBe(7);
  });

  it('toggles billing mode', () => {
    component.toggleBilling();
    expect(component.isYearly).toBeTrue();
  });

  it('starts trials and navigates back to the dashboard', () => {
    component.startTrial();

    expect(subscriptionService.startTrial).toHaveBeenCalledWith(7);
    expect(authService.getProfile).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('redirects unauthenticated users during upgrades', () => {
    component.userId = null;
    component.upgrade();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('opens Razorpay when an upgrade order is created', () => {
    const openRazorpaySpy = spyOn<any>(component, 'openRazorpay');

    component.upgrade();

    expect(subscriptionService.createOrder).toHaveBeenCalled();
    expect(openRazorpaySpy).toHaveBeenCalled();
  });
});
