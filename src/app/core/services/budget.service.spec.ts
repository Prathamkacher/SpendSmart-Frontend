import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BudgetService } from './budget.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('BudgetService', () => {
  let service: BudgetService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(BudgetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches active budgets', () => {
    service.getActiveBudgets().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/budgets/active');
    expect(req.request.method).toBe('GET');
    req.flush(createApiResponse([]));
  });

  it('creates, updates, deletes, and triggers resets', () => {
    const payload = {
      categoryId: 2,
      name: 'Food',
      limitAmount: 5000,
      currency: 'INR',
      period: 'MONTHLY' as const,
      startDate: '2026-05-01',
      endDate: '2026-05-31'
    };

    service.createBudget(payload).subscribe();
    httpMock.expectOne('http://localhost:8080/budgets').flush(createApiResponse(payload));

    service.updateBudget(9, payload).subscribe();
    httpMock.expectOne('http://localhost:8080/budgets/9').flush(createApiResponse(payload));

    service.deleteBudget(9).subscribe();
    httpMock.expectOne('http://localhost:8080/budgets/9').flush(createApiResponse(void 0));

    service.triggerReset().subscribe();
    const resetReq = httpMock.expectOne('http://localhost:8080/budgets/reset');
    expect(resetReq.request.method).toBe('POST');
    resetReq.flush(createApiResponse(void 0));
  });
});
