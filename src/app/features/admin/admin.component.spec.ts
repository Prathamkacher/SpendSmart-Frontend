import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AdminComponent } from './admin.component';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import * as downloadUtils from '../../shared/utils/file-download.utils';
import { createApiResponse } from '../../../testing/test-helpers';

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;
  let adminService: jasmine.SpyObj<AdminService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    adminService = jasmine.createSpyObj<AdminService>('AdminService', [
      'getAnalytics',
      'getUsers',
      'getTransactions',
      'suspendUser',
      'activateUser',
      'deleteUser',
      'sendNotification',
      'exportReport'
    ]);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['error']);

    adminService.getAnalytics.and.returnValue(of(createApiResponse({ totalUsers: 10, totalTransactions: 20, totalExpenses: 300, totalIncome: 500, avgSpendingPerUser: 30, userRegistrationTrend: { '2026-05': 4 } })));
    adminService.getUsers.and.returnValue(of(createApiResponse([{ userId: 7, email: 'alex@example.com' }])));
    adminService.getTransactions.and.returnValue(of(createApiResponse([{ id: 'tx-1' }])));
    adminService.suspendUser.and.returnValue(of(createApiResponse(void 0)));
    adminService.activateUser.and.returnValue(of(createApiResponse(void 0)));
    adminService.deleteUser.and.returnValue(of(createApiResponse(void 0)));
    adminService.sendNotification.and.returnValue(of(createApiResponse(void 0)));
    adminService.exportReport.and.returnValue(of(new Blob(['report'])));

    await TestBed.configureTestingModule({
      imports: [AdminComponent, RouterTestingModule],
      providers: [
        { provide: AdminService, useValue: adminService },
        { provide: ToastService, useValue: toastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads analytics, users, and transactions on init', () => {
    expect(component.analytics?.totalUsers).toBe(10);
    expect(component.users.length).toBe(1);
    expect(component.transactions.length).toBe(1);
    expect(adminService.getAnalytics).toHaveBeenCalled();
    expect(adminService.getUsers).toHaveBeenCalled();
    expect(adminService.getTransactions).toHaveBeenCalled();
  });

  it('shows a toast when analytics fail to load', () => {
    adminService.getAnalytics.and.returnValue(
      throwError(() => new Error('Failed'))
    );

    component.loadData();
    expect(toastService.error).toHaveBeenCalledWith('Failed to load analytics');
  });

  it('validates and sends global notifications', () => {
    component.sendGlobalNotification();
    expect(toastService.error).toHaveBeenCalledWith('Please fill in all fields');

    component.notifTitle = 'Update';
    component.notifMessage = 'Backend maintenance';
    component.sendGlobalNotification();
    expect(adminService.sendNotification).toHaveBeenCalled();
    expect(component.notifTitle).toBe('');
  });

  it('exports reports through the shared blob helper', () => {
    const createObjectUrlSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('blob:report');
    const revokeObjectUrlSpy = spyOn(window.URL, 'revokeObjectURL');
    const anchor = document.createElement('a');
    const clickSpy = spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.returnValue(anchor);
    component.exportReport();
    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:report');
  });
});
