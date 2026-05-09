import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SubscriptionService } from './subscription.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(SubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creates Razorpay orders', () => {
    service.createOrder({ userId: 7, planName: 'MONTHLY' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/payments/create-order');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'order_1', amount: 999, currency: 'INR', keyId: 'rzp_key' });
  });

  it('verifies payments and starts trials', () => {
    service.verifyPayment({
      razorpayOrderId: 'order_1',
      razorpayPaymentId: 'pay_1',
      razorpaySignature: 'sig',
      userId: 7
    }).subscribe();

    httpMock.expectOne('http://localhost:8080/payments/verify').flush(true);

    service.startTrial(7).subscribe();
    const trialReq = httpMock.expectOne(
      request =>
        request.url === 'http://localhost:8080/auth/profile/upgrade' &&
        request.params.get('userId') === '7' &&
        request.params.get('planType') === 'TRIAL'
    );
    expect(trialReq.request.method).toBe('PUT');
    trialReq.flush(createApiResponse(void 0));
  });
});
