import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RecurringService } from './recurring.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('RecurringService', () => {
  let service: RecurringService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(RecurringService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('covers recurring retrieval endpoints', () => {
    expect().nothing();

    service.getUserRecurring().subscribe();
    httpMock.expectOne('http://localhost:8080/recurring/user').flush(createApiResponse([]));

    service.getActiveRecurring().subscribe();
    httpMock.expectOne('http://localhost:8080/recurring/active').flush(createApiResponse([]));

    service.getRecurringById(12).subscribe();
    httpMock.expectOne('http://localhost:8080/recurring/12').flush(createApiResponse({} as any));
  });

  it('covers recurring mutation endpoints', () => {
    const payload = {
      userId: 7,
      categoryId: 3,
      title: 'Rent',
      amount: 18000,
      type: 'EXPENSE' as const,
      frequency: 'MONTHLY' as const,
      startDate: '2026-05-01',
      nextDueDate: '2026-06-01',
      isActive: true
    };

    service.addRecurring(payload).subscribe();
    const createReq = httpMock.expectOne('http://localhost:8080/recurring');
    expect(createReq.request.method).toBe('POST');
    createReq.flush(createApiResponse(payload));

    service.updateRecurring(12, payload).subscribe();
    const updateReq = httpMock.expectOne('http://localhost:8080/recurring/12');
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush(createApiResponse(payload));

    service.activateRecurring(12).subscribe();
    const activateReq = httpMock.expectOne('http://localhost:8080/recurring/activate/12');
    expect(activateReq.request.method).toBe('PUT');
    expect(activateReq.request.body).toEqual({});
    activateReq.flush(createApiResponse({ ...payload, isActive: true }));

    service.deactivateRecurring(12).subscribe();
    const deactivateReq = httpMock.expectOne('http://localhost:8080/recurring/deactivate/12');
    expect(deactivateReq.request.method).toBe('PUT');
    expect(deactivateReq.request.body).toEqual({});
    deactivateReq.flush(createApiResponse({ ...payload, isActive: false }));

    service.deleteRecurring(12).subscribe();
    const deleteReq = httpMock.expectOne('http://localhost:8080/recurring/12');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(createApiResponse(void 0));
  });
});
