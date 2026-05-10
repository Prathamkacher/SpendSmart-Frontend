import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Notification {
  notificationId: number;
  recipientId: number;
  type: 'BUDGET_ALERT' | 'RECURRING_DUE' | 'MONTHLY_SUMMARY' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
  isRead: boolean;
  isAcknowledged: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/notifications`;

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  loadNotifications(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.http.get<any>(`${this.apiUrl}/${user.userId}`).subscribe(res => {
      // Handle standard API response wrapper { success: true, data: [...] }
      const data = res.data || res;
      this.notifications.set(Array.isArray(data) ? data : []);
      this.updateUnreadCount();
    });
  }

  loadUnreadCount(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.http.get<number>(`${this.apiUrl}/unread-count/${user.userId}`).subscribe(count => {
      this.unreadCount.set(count);
    });
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/read/${id}`, {}).pipe(
      tap(() => {
        this.notifications.update(prev => 
          prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n)
        );
        this.updateUnreadCount();
      })
    );
  }

  markAllAsRead(): Observable<void> {
    const user = this.authService.currentUser();
    return this.http.put<void>(`${this.apiUrl}/read-all/${user?.userId}`, {}).pipe(
      tap(() => {
        this.notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      })
    );
  }

  acknowledge(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/acknowledge/${id}`, {}).pipe(
      tap(() => {
        this.notifications.update(prev => 
          prev.map(n => n.notificationId === id ? { ...n, isAcknowledged: true, isRead: true } : n)
        );
        this.updateUnreadCount();
      })
    );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notifications.update(prev => prev.filter(n => n.notificationId !== id));
        this.updateUnreadCount();
      })
    );
  }

  private updateUnreadCount(): void {
    const count = this.notifications().filter(n => !n.isRead).length;
    this.unreadCount.set(count);
  }
}
