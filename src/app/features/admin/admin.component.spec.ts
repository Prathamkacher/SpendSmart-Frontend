import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AdminComponent } from './admin.component';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;
  let adminService: jasmine.SpyObj<AdminService>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    adminService = jasmine.createSpyObj<AdminService>('AdminService', [
      'getAnalytics',
      'getUsers',
      'getTransactions',
      'suspendUser',
      'activateUser',
      'deleteUser',
      'updateRole',
      'sendNotification',
      'exportReport'
    ]);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout'], {
      currentUser: signal(null).asReadonly()
    });
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['error']);

    adminService.getAnalytics.and.returnValue(of(createApiResponse({ totalUsers: 10, totalTransactions: 20, totalExpenses: 300, totalIncome: 500, avgSpendingPerUser: 30, userRegistrationTrend: { '2026-05': 4 } })));
    adminService.getUsers.and.returnValue(of(createApiResponse([{ userId: 7, email: 'alex@example.com' }])));
    adminService.getTransactions.and.returnValue(of(createApiResponse([{ id: 'tx-1' }])));
    adminService.suspendUser.and.returnValue(of(createApiResponse(void 0)));
    adminService.activateUser.and.returnValue(of(createApiResponse(void 0)));
    adminService.deleteUser.and.returnValue(of(createApiResponse(void 0)));
    adminService.updateRole.and.returnValue(of(createApiResponse(void 0)));
    adminService.sendNotification.and.returnValue(of(createApiResponse(void 0)));
    adminService.exportReport.and.returnValue(of(new Blob(['report'])));

    await TestBed.configureTestingModule({
      imports: [AdminComponent, RouterTestingModule],
      providers: [
        { provide: AdminService, useValue: adminService },
        { provide: ToastService, useValue: toastService },
        { provide: AuthService, useValue: authService }
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

  it('switches sections', () => {
    component.switchSection('users');
    expect(component.activeSection).toBe('users');
  });

  it('suspends and activates users', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.suspendUser(1);
    expect(adminService.suspendUser).toHaveBeenCalledWith(1);
    expect(adminService.getUsers).toHaveBeenCalledTimes(2);

    component.activateUser(1);
    expect(adminService.activateUser).toHaveBeenCalledWith(1);
    expect(adminService.getUsers).toHaveBeenCalledTimes(3);
  });

  it('deletes user if confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteUser(1);
    expect(window.confirm).toHaveBeenCalledWith('⚠️ PERMANENT ACTION: Are you sure you want to delete this user? This cannot be undone.');
    expect(adminService.deleteUser).toHaveBeenCalledWith(1);
    expect(adminService.getUsers).toHaveBeenCalledTimes(2);
  });

  it('does not delete user if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteUser(1);
    expect(adminService.deleteUser).not.toHaveBeenCalled();
  });

  it('gets registration labels and data', () => {
    const labels = component.getRegistrationLabels();
    expect(labels).toEqual(['2026-05']);
    const data = component.getRegistrationData();
    expect(data).toEqual([4]);
  });

  it('handles null analytics for getters', () => {
    component.analytics = null;
    expect(component.getRegistrationLabels()).toEqual([]);
    expect(component.getRegistrationData()).toEqual([]);
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
