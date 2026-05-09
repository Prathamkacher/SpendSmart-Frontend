import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { mockUser } from '../../../testing/test-helpers';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(mockUser).asReadonly()
          }
        }
      ]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads notifications and updates unread count', () => {
    service.loadNotifications();

    const req = httpMock.expectOne('http://localhost:8080/notifications/7');
    req.flush([
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
        type: 'SYSTEM',
        severity: 'INFO',
        title: 'Read',
        message: 'Already read',
        isRead: true,
        isAcknowledged: false,
        createdAt: '2026-05-08T09:00:00Z'
      }
    ]);

    expect(service.notifications().length).toBe(2);
    expect(service.unreadCount()).toBe(1);
  });

  it('marks notifications as read and keeps the signal state in sync', () => {
    service.notifications.set([
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
      }
    ]);

    service.markAsRead(1).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/notifications/read/1');
    expect(req.request.method).toBe('PUT');
    req.flush({
      notificationId: 1,
      recipientId: 7,
      type: 'SYSTEM',
      severity: 'INFO',
      title: 'Welcome',
      message: 'Hello',
      isRead: true,
      isAcknowledged: false,
      createdAt: '2026-05-08T10:00:00Z'
    });

    expect(service.notifications()[0].isRead).toBeTrue();
    expect(service.unreadCount()).toBe(0);
  });

  it('marks all notifications as read and deletes notifications', () => {
    service.notifications.set([
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
      }
    ]);

    service.markAllAsRead().subscribe();
    httpMock.expectOne('http://localhost:8080/notifications/read-all/7').flush({});
    expect(service.unreadCount()).toBe(0);

    service.deleteNotification(1).subscribe();
    httpMock.expectOne('http://localhost:8080/notifications/1').flush({});
    expect(service.notifications().length).toBe(0);
  });
});
