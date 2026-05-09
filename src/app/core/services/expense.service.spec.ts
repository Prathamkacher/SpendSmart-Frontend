import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ExpenseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests expenses by month with paging params', () => {
    service.getExpensesByMonth(2026, 5, 1, 25).subscribe();

    const req = httpMock.expectOne(
      request =>
        request.url === 'http://localhost:8080/expenses/month' &&
        request.params.get('year') === '2026' &&
        request.params.get('month') === '5' &&
        request.params.get('page') === '1' &&
        request.params.get('size') === '25'
    );

    expect(req.request.method).toBe('GET');
    req.flush(
      createApiResponse({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 25,
        number: 1
      })
    );
  });

  it('covers list, detail, and total expense endpoints', () => {
    expect().nothing();
    service.getExpenses(0, 20).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/expenses' &&
          request.params.get('page') === '0' &&
          request.params.get('size') === '20'
      )
      .flush(
        createApiResponse({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 20,
          number: 0
        })
      );

    service.getExpenseById(5).subscribe();
    httpMock.expectOne('http://localhost:8080/expenses/5').flush(createApiResponse({} as any));

    service.getTotal().subscribe();
    httpMock.expectOne('http://localhost:8080/expenses/total/user').flush(createApiResponse(5000));

    service.getTotalByMonth(2026, 5).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/expenses/total/month' &&
          request.params.get('year') === '2026' &&
          request.params.get('month') === '5'
      )
      .flush(createApiResponse(5000));
  });

  it('creates, updates, and deletes expenses through the expected endpoints', () => {
    const payload = {
      userId: 7,
      categoryId: 2,
      title: 'Dinner',
      amount: 500,
      currency: 'INR',
      type: 'EXPENSE' as const,
      paymentMethod: 'CARD' as const,
      date: '2026-05-08',
      isRecurring: false
    };

    service.addExpense(payload).subscribe();
    const createReq = httpMock.expectOne('http://localhost:8080/expenses');
    expect(createReq.request.method).toBe('POST');
    createReq.flush(createApiResponse(payload));

    service.updateExpense(4, payload).subscribe();
    const updateReq = httpMock.expectOne('http://localhost:8080/expenses/4');
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush(createApiResponse(payload));

    service.deleteExpense(4).subscribe();
    const deleteReq = httpMock.expectOne('http://localhost:8080/expenses/4');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(createApiResponse(void 0));
  });
});
