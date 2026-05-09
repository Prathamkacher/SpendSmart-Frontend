import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <button 
        (click)="toggleDropdown()"
        class="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors group"
      >
        <span class="material-symbols-rounded text-2xl group-hover:scale-110 transition-transform">notifications</span>
        @if (unreadCount() > 0) {
          <span class="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 animate-bounce">
            {{ unreadCount() > 9 ? '9+' : unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>
        <div class="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="p-4 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between">
            <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Notifications</h3>
            <button 
              *ngIf="unreadCount() > 0"
              (click)="markAllAsRead()"
              class="text-[10px] font-bold text-emerald-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div class="max-h-[400px] overflow-y-auto">
            @for (n of notifications().slice(0, 5); track n.notificationId) {
              <div 
                [class.bg-slate-50]="!n.isRead"
                [class.dark:bg-gray-800]="!n.isRead"
                class="p-4 border-b border-slate-50 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                (click)="onNotificationClick(n)"
              >
                <div class="flex gap-3">
                  <div [class]="getSeverityClass(n.severity)" class="w-2 h-2 rounded-full mt-1.5 shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-black text-slate-800 dark:text-white mb-1 truncate">{{ n.title }}</p>
                    <p class="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{{ n.message }}</p>
                    <p class="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tight">{{ n.createdAt | date:'shortTime' }}</p>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center">
                <span class="material-symbols-rounded text-4xl text-slate-200 dark:text-gray-700 mb-2">notifications_off</span>
                <p class="text-xs text-slate-400 font-medium">All caught up!</p>
              </div>
            }
          </div>

          <a 
            routerLink="/notifications" 
            (click)="isOpen.set(false)"
            class="block p-3 text-center text-[11px] font-black text-slate-500 hover:text-emerald-600 border-t border-slate-50 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 uppercase tracking-widest transition-colors"
          >
            View all notifications
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class NotificationBellComponent implements OnInit {
  private notificationService = inject(NotificationService);
  
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  isOpen = signal(false);

  ngOnInit() {
    this.notificationService.loadNotifications();
  }

  toggleDropdown() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.notificationService.loadNotifications();
    }
  }

  onNotificationClick(n: Notification) {
    if (!n.isRead) {
      this.notificationService.markAsRead(n.notificationId).subscribe();
    }
    // Handle navigation based on relatedType if needed
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
      case 'WARNING': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
      default: return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]';
    }
  }
}
