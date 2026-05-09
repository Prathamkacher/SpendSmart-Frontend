import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminService } from './admin.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads users and platform analytics', () => {
    let usersLoaded = false;
    let analyticsLoaded = false;

    service.getUsers().subscribe(() => {
      usersLoaded = true;
    });
    httpMock.expectOne('http://localhost:8080/auth/admin/users').flush(createApiResponse([]));

    service.getAnalytics().subscribe(() => {
      analyticsLoaded = true;
    });
    httpMock.expectOne('http://localhost:8080/auth/admin/analytics').flush(createApiResponse({ totalUsers: 10 }));

    expect(usersLoaded).toBeTrue();
    expect(analyticsLoaded).toBeTrue();
  });

  it('covers user management and transaction endpoints', () => {
    expect().nothing();
    service.suspendUser(7).subscribe();
    httpMock.expectOne('http://localhost:8080/auth/admin/users/7/suspend').flush(createApiResponse(void 0));

    service.activateUser(7).subscribe();
    httpMock.expectOne('http://localhost:8080/auth/admin/users/7/activate').flush(createApiResponse(void 0));

    service.deleteUser(7).subscribe();
    httpMock.expectOne('http://localhost:8080/auth/admin/users/7').flush(createApiResponse(void 0));

    service.getTransactions().subscribe();
    httpMock.expectOne('http://localhost:8080/auth/admin/transactions').flush(createApiResponse([]));
  });

  it('sends notifications and exports reports', () => {
    service.sendNotification({ title: 'Hello', message: 'World', severity: 'INFO' }).subscribe();
    const notifyReq = httpMock.expectOne('http://localhost:8080/auth/admin/notify');
    expect(notifyReq.request.method).toBe('POST');
    notifyReq.flush(createApiResponse(void 0));

    service.exportReport().subscribe();
    const exportReq = httpMock.expectOne('http://localhost:8080/auth/admin/report');
    expect(exportReq.request.responseType).toBe('blob');
    exportReq.flush(new Blob(['report']));
  });
});
