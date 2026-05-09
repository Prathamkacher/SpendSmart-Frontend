import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NotificationCenterComponent } from './notification-center.component';
import { NotificationService } from '../../../core/services/notification.service';

describe('NotificationCenterComponent', () => {
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let component: NotificationCenterComponent;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let notifications = signal([
    {
      notificationId: 1,
      recipientId: 7,
      type: 'SYSTEM',
      severity: 'INFO',
      title: 'Welcome',
      message: 'Hello',
      isRead: false,
      isAcknowledged: false,
      createdAt: '2026-05-08T10:00:00Z'
    },
    {
      notificationId: 2,
      recipientId: 7,
      type: 'BUDGET_ALERT',
      severity: 'CRITICAL',
      title: 'Budget hit',
      message: 'Food budget exceeded',
      isRead: true,
      isAcknowledged: false,
      createdAt: '2026-05-07T10:00:00Z'
    }
  ]);

  beforeEach(async () => {
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'loadNotifications',
      'markAsRead',
      'markAllAsRead',
      'acknowledge',
      'deleteNotification'
    ]);

    notificationService.markAsRead.and.returnValue(of({} as any));
    notificationService.markAllAsRead.and.returnValue(of(void 0));
    notificationService.acknowledge.and.returnValue(of({} as any));
    notificationService.deleteNotification.and.returnValue(of(void 0));
    Object.defineProperties(notificationService, {
      notifications: { value: notifications.asReadonly() },
      unreadCount: { value: signal(1).asReadonly() }
    });

    await TestBed.configureTestingModule({
      imports: [NotificationCenterComponent],
      providers: [{ provide: NotificationService, useValue: notificationService }]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads notifications on init', () => {
    expect(notificationService.loadNotifications).toHaveBeenCalled();
  });

  it('filters notifications by severity and type', () => {
    component.selectedSeverity.set('CRITICAL');
    expect(component.filteredNotifications().length).toBe(1);

    component.selectedType.set('BUDGET_ALERT');
    expect(component.filteredNotifications()[0].notificationId).toBe(2);
  });

  it('marks notifications and deletes after confirmation', () => {
    component.markAsRead(1);
    component.markAllAsRead();
    expect(notificationService.markAsRead).toHaveBeenCalledWith(1);
    expect(notificationService.markAllAsRead).toHaveBeenCalled();

    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteNotification(2);
    expect(notificationService.deleteNotification).toHaveBeenCalledWith(2);
  });

  it('returns the expected severity and icon classes', () => {
    expect(component.getSeverityBg('CRITICAL')).toContain('rose');
    expect(component.getSeverityBadgeClass('WARNING')).toContain('amber');
    expect(component.getTypeIcon('MONTHLY_SUMMARY')).toBe('insights');
  });
});
