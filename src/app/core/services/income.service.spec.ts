import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IncomeService } from './income.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('IncomeService', () => {
  let service: IncomeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(IncomeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests incomes by source with paging params', () => {
    service.getIncomesBySource('SALARY', 2, 15).subscribe();

    const req = httpMock.expectOne(
      request =>
        request.url === 'http://localhost:8080/incomes/source' &&
        request.params.get('source') === 'SALARY' &&
        request.params.get('page') === '2' &&
        request.params.get('size') === '15'
    );

    expect(req.request.method).toBe('GET');
    req.flush(
      createApiResponse({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 15,
        number: 2
      })
    );
  });

  it('covers list, detail, and total income endpoints', () => {
    expect().nothing();
    service.getIncomes(0, 20).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/incomes' &&
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

    service.getIncomeById(8).subscribe();
    httpMock.expectOne('http://localhost:8080/incomes/8').flush(createApiResponse({} as any));

    service.getTotal().subscribe();
    httpMock.expectOne('http://localhost:8080/incomes/total/user').flush(createApiResponse(100000));

    service.getTotalByMonth(2026, 5).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/incomes/total/month' &&
          request.params.get('year') === '2026' &&
          request.params.get('month') === '5'
      )
      .flush(createApiResponse(100000));
  });

  it('creates, updates, and deletes incomes', () => {
    const payload = {
      title: 'Salary',
      amount: 100000,
      currency: 'INR',
      source: 'SALARY' as const,
      date: '2026-05-01',
      isRecurring: false
    };

    service.addIncome(payload).subscribe();
    const createReq = httpMock.expectOne('http://localhost:8080/incomes');
    expect(createReq.request.method).toBe('POST');
    createReq.flush(createApiResponse(payload));

    service.updateIncome(3, payload).subscribe();
    const updateReq = httpMock.expectOne('http://localhost:8080/incomes/3');
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush(createApiResponse(payload));

    service.deleteIncome(3).subscribe();
    const deleteReq = httpMock.expectOne('http://localhost:8080/incomes/3');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(createApiResponse(void 0));
  });
});
