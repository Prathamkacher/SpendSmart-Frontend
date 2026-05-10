import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecurringService, RecurringTransaction } from './recurring.service';
import { environment } from '../../../environments/environment';

describe('RecurringService', () => {
  let service: RecurringService;
  let httpMock: HttpTestingController;

  const mockTransaction: RecurringTransaction = {
    recurringId: 1,
    userId: 2,
    categoryId: 3,
    title: 'Netflix',
    amount: 15.99,
    type: 'EXPENSE',
    frequency: 'MONTHLY',
    startDate: '2023-01-01',
    nextDueDate: '2023-02-01',
    isActive: true,
    paymentMethod: 'CARD'
  };

  const mockResponse = {
    success: true,
    message: 'Success',
    data: mockTransaction,
    timestamp: '2023-01-01T00:00:00'
  };

  const mockListResponse = {
    ...mockResponse,
    data: [mockTransaction]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecurringService]
    });
    service = TestBed.inject(RecurringService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add recurring transaction', () => {
    service.addRecurring(mockTransaction).subscribe(res => {
      expect(res.data.title).toBe('Netflix');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/recurring`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockTransaction);
    req.flush(mockResponse);
  });

  it('should get user recurring transactions', () => {
    service.getUserRecurring().subscribe(res => {
      expect(res.data.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/recurring/user`);
    expect(req.request.method).toBe('GET');
    req.flush(mockListResponse);
  });

  it('should get active recurring transactions', () => {
    service.getActiveRecurring().subscribe(res => {
      expect(res.data.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/recurring/active`);
    expect(req.request.method).toBe('GET');
    req.flush(mockListResponse);
  });

  it('should get recurring by id', () => {
    service.getRecurringById(1).subscribe(res => {
      expect(res.data.recurringId).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/recurring/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update recurring transaction', () => {
    service.updateRecurring(1, mockTransaction).subscribe(res => {
      expect(res.data.title).toBe('Netflix');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/recurring/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockTransaction);
    req.flush(mockResponse);
  });

  it('should deactivate recurring transaction', () => {
    service.deactivateRecurring(1).subscribe(res => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/recurring/deactivate/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('should activate recurring transaction', () => {
    service.activateRecurring(1).subscribe(res => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/recurring/activate/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('should delete recurring transaction', () => {
    service.deleteRecurring(1).subscribe(res => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/recurring/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ...mockResponse, data: null });
  });
});
