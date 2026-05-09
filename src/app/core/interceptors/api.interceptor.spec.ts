import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiInterceptor } from './api.interceptor';
import { ToastService } from '../services/toast.service';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastService }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows success toasts for mutating successful API responses', () => {
    http.post('/budgets', {}).subscribe();

    const req = httpMock.expectOne('/budgets');
    req.flush({ success: true, message: 'Saved', data: {} });

    expect(toastService.success).toHaveBeenCalledWith('Saved');
  });

  it('does not show success toasts for GET requests', () => {
    http.get('/budgets').subscribe();

    httpMock.expectOne('/budgets').flush({ success: true, message: 'Fetched', data: {} });
    expect(toastService.success).not.toHaveBeenCalled();
  });

  it('translates validation errors into a short toast message', () => {
    http.post('/budgets', {}).subscribe({
      error: () => undefined
    });

    httpMock.expectOne('/budgets').flush(
      {
        message: 'Validation failed',
        data: { amount: 'Amount is required' }
      },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(toastService.error).toHaveBeenCalledWith('Please check the form for errors');
  });

  it('shows connection-friendly messages for network failures', () => {
    http.get('/budgets').subscribe({
      error: () => undefined
    });

    httpMock.expectOne('/budgets').flush({}, { status: 0, statusText: 'Unknown Error' });
    expect(toastService.error).toHaveBeenCalledWith('Connection lost. Is the backend running?');
  });
});
