import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 class="text-xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Notifications
          </h1>
          <p class="text-[10px] md:text-base text-slate-500 dark:text-gray-400 font-medium">Alerts and updates.</p>
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            (click)="markAllAsRead()"
            [disabled]="unreadCount() === 0"
            class="bg-white dark:bg-gray-900 text-slate-700 dark:text-white font-bold px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-800 text-[10px] md:text-sm transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-rounded mr-1.5 text-lg md:text-xl">done_all</span>
            <span>Mark Read</span>
          </button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="bg-white dark:bg-gray-900 p-3 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-end gap-3 md:gap-6">
        <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full">
          <!-- Urgency Filter -->
          <div class="space-y-1 md:space-y-2">
            <label class="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Urgency</label>
            <select 
              [ngModel]="selectedSeverity()" 
              (ngModelChange)="selectedSeverity.set($event)"
              class="w-full bg-slate-50 dark:bg-gray-800 border-none rounded-xl md:rounded-2xl px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none appearance-none cursor-pointer"
            >
              <option [ngValue]="null">All</option>
              @for (s of severities; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>

          <!-- Type Filter -->
          <div class="space-y-1 md:space-y-2">
            <label class="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Type</label>
            <select 
              [ngModel]="selectedType()" 
              (ngModelChange)="selectedType.set($event)"
              class="w-full bg-slate-50 dark:bg-gray-800 border-none rounded-xl md:rounded-2xl px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none appearance-none cursor-pointer"
            >
              <option [ngValue]="null">All</option>
              @for (t of types; track t) {
                <option [value]="t">{{ t.replace('_', ' ') }}</option>
              }
            </select>
          </div>

          <!-- Quick Stats -->
          <div class="col-span-2 md:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-white shadow-lg flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="material-symbols-rounded text-lg md:text-2xl opacity-50">notifications</span>
              <div>
                <p class="text-[8px] font-black uppercase tracking-widest opacity-80">Unread</p>
                <h2 class="text-sm md:text-xl font-black leading-none">{{ unreadCount() }}</h2>
              </div>
            </div>
            <button (click)="resetFilters()" class="text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30 transition-colors">Reset</button>
          </div>
        </div>
      </div>

      <!-- Notification List -->
      <div class="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
        @for (n of filteredNotifications(); track n.notificationId) {
          <div 
            [class.border-l-4]="!n.isRead"
            [class.border-l-emerald-500]="!n.isRead"
            class="bg-white dark:bg-gray-900 p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-4">
              <div class="flex flex-col md:flex-row gap-2 md:gap-4">
                <div [class]="getSeverityBg(n.severity)" class="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0">
                  <span class="material-symbols-rounded text-lg md:text-2xl">{{ getTypeIcon(n.type) }}</span>
                </div>
                <div class="overflow-hidden">
                  <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                    <h4 class="text-[10px] md:text-base font-black text-slate-800 dark:text-white truncate">{{ n.title }}</h4>
                    <span [class]="getSeverityBadgeClass(n.severity)" class="text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest w-fit">
                      {{ n.severity }}
                    </span>
                  </div>
                  <p class="text-[9px] md:text-sm text-slate-500 dark:text-gray-400 leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">{{ n.message }}</p>
                  <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-2 md:mt-4">
                    <span class="text-[7px] md:text-[10px] font-bold text-slate-400 flex items-center">
                      <span class="material-symbols-rounded text-[10px] md:text-sm mr-1">schedule</span>
                      {{ n.createdAt | date:'MMM d, h:mm a' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Compact Actions Mobile -->
              <div class="flex items-center space-x-1 mt-2 md:mt-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                @if (!n.isRead) {
                  <button (click)="markAsRead(n.notificationId)" class="p-1.5 md:p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                    <span class="material-symbols-rounded text-sm md:text-xl">done</span>
                  </button>
                }
                <button (click)="deleteNotification(n.notificationId)" class="p-1.5 md:p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                  <span class="material-symbols-rounded text-sm md:text-xl">delete</span>
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-gray-800 shadow-sm text-center">
            <div class="w-12 h-12 md:w-20 md:h-20 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <span class="material-symbols-rounded text-2xl md:text-4xl text-slate-300">notifications_none</span>
            </div>
            <h3 class="text-sm md:text-lg font-black text-slate-800 dark:text-white mb-1 md:mb-2">No alerts</h3>
            <p class="text-slate-400 text-[10px] md:text-sm font-medium">All clear for now.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class NotificationCenterComponent implements OnInit {
  private notificationService = inject(NotificationService);
  
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  severities = ['INFO', 'WARNING', 'CRITICAL'];
  types = ['BUDGET_ALERT', 'RECURRING_DUE', 'MONTHLY_SUMMARY', 'SYSTEM'];

  selectedSeverity = signal<string | null>(null);
  selectedType = signal<string | null>(null);

  filteredNotifications = computed(() => {
    let list = this.notifications();
    if (this.selectedSeverity()) {
      list = list.filter(n => n.severity === this.selectedSeverity());
    }
    if (this.selectedType()) {
      list = list.filter(n => n.type === this.selectedType());
    }
    return list;
  });

  ngOnInit() {
    this.notificationService.loadNotifications();
  }

  toggleSeverity(s: string) {
    this.selectedSeverity.update(curr => curr === s ? null : s);
  }

  toggleType(t: string) {
    this.selectedType.update(curr => curr === t ? null : t);
  }

  resetFilters() {
    this.selectedSeverity.set(null);
    this.selectedType.set(null);
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  acknowledge(id: number) {
    this.notificationService.acknowledge(id).subscribe();
  }

  deleteNotification(id: number) {
    if (confirm('Delete this notification?')) {
      this.notificationService.deleteNotification(id).subscribe();
    }
  }

  getSeverityBg(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-50 text-rose-600';
      case 'WARNING': return 'bg-amber-50 text-amber-600';
      default: return 'bg-blue-50 text-blue-600';
    }
  }

  getSeverityBadgeClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-500 text-white';
      case 'WARNING': return 'bg-amber-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'BUDGET_ALERT': return 'account_balance_wallet';
      case 'RECURRING_DUE': return 'event_repeat';
      case 'MONTHLY_SUMMARY': return 'insights';
      default: return 'notifications';
    }
  }
}
