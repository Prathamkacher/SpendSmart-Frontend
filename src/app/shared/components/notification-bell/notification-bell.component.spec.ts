import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NotificationBellComponent } from './notification-bell.component';
import { NotificationService } from '../../../core/services/notification.service';

describe('NotificationBellComponent', () => {
  let fixture: ComponentFixture<NotificationBellComponent>;
  let component: NotificationBellComponent;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'loadNotifications',
      'markAsRead',
      'markAllAsRead'
    ]);
    notificationService.markAsRead.and.returnValue(of({} as any));
    notificationService.markAllAsRead.and.returnValue(of(void 0));
    Object.defineProperties(notificationService, {
      notifications: {
        value: signal([
          {
            notificationId: 1,
            recipientId: 7,
            type: 'SYSTEM',
            severity: 'WARNING',
            title: 'Reminder',
            message: 'Due soon',
            isRead: false,
            isAcknowledged: false,
            createdAt: '2026-05-08T10:00:00Z'
          }
        ]).asReadonly()
      },
      unreadCount: { value: signal(1).asReadonly() }
    });

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [{ provide: NotificationService, useValue: notificationService }]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads notifications on init and when opening the dropdown', () => {
    expect(notificationService.loadNotifications).toHaveBeenCalled();

    component.toggleDropdown();
    expect(component.isOpen()).toBeTrue();
    expect(notificationService.loadNotifications).toHaveBeenCalledTimes(2);
  });

  it('marks unread notifications as read on click', () => {
    component.onNotificationClick(component.notifications()[0]);
    expect(notificationService.markAsRead).toHaveBeenCalledWith(1);
  });

  it('maps severity colors', () => {
    expect(component.getSeverityClass('CRITICAL')).toContain('rose');
    expect(component.getSeverityClass('INFO')).toContain('blue');
  });
});
