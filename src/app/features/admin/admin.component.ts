import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, PlatformAnalytics, TransactionDTO } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { downloadBlob } from '../../shared/utils/file-download.utils';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  analytics: PlatformAnalytics | null = null;
  users: any[] = [];
  transactions: TransactionDTO[] = [];
  activeSection: 'dashboard' | 'users' | 'transactions' | 'notifications' | 'reports' = 'dashboard';
  
  // Notification Form
  notifTitle: string = '';
  notifMessage: string = '';
  notifSeverity: string = 'INFO';

  loading: boolean = false;
  currentUser = this.authService.currentUser;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.adminService.getAnalytics().subscribe({
      next: (res) => {
        if (res.success) this.analytics = res.data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load analytics');
        this.loading = false;
      }
    });

    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.success) this.users = res.data;
      }
    });

    this.adminService.getTransactions().subscribe({
      next: (res) => {
        if (res.success) this.transactions = res.data;
      }
    });
  }

  switchSection(section: any): void {
    this.activeSection = section;
  }

  suspendUser(userId: number): void {
    if (confirm('Are you sure you want to suspend this user?')) {
      this.adminService.suspendUser(userId).subscribe({
        next: () => this.loadData(),
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to suspend user');
        }
      });
    }
  }

  activateUser(userId: number): void {
    if (confirm('Are you sure you want to reactivate this user?')) {
      this.adminService.activateUser(userId).subscribe({
        next: () => this.loadData(),
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to activate user');
        }
      });
    }
  }

  deleteUser(userId: number): void {
    if (confirm('⚠️ PERMANENT ACTION: Are you sure you want to delete this user? This cannot be undone.')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => this.loadData(),
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to delete user');
        }
      });
    }
  }

  updateRole(userId: number, role: string): void {
    if (userId === 3) {
      this.toastService.error('The super-admin role cannot be modified');
      return;
    }
    const action = role === 'ADMIN' ? 'promote' : 'demote';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      this.adminService.updateRole(userId, role).subscribe({
        next: () => this.loadData(),
        error: (err: any) => {
          this.toastService.error(err?.error?.message || `Failed to ${action} user`);
        }
      });
    }
  }

  sendGlobalNotification(): void {
    if (!this.notifTitle || !this.notifMessage) {
      this.toastService.error('Please fill in all fields');
      return;
    }

    this.adminService.sendNotification({
      title: this.notifTitle,
      message: this.notifMessage,
      severity: this.notifSeverity
    }).subscribe({
      next: () => {
        this.notifTitle = '';
        this.notifMessage = '';
      }
    });
  }

  exportReport(): void {
    this.adminService.exportReport().subscribe({
      next: (blob) => {
        downloadBlob(
          blob,
          `platform_report_${new Date().toISOString().split('T')[0]}.json`
        );
      }
    });
  }

  getRegistrationLabels(): string[] {
    return this.analytics
      ? Object.keys(this.analytics.userRegistrationTrend).sort((left, right) => left.localeCompare(right))
      : [];
  }

  getRegistrationData(): number[] {
    const labels = this.getRegistrationLabels();
    return labels.map(l => this.analytics!.userRegistrationTrend[l]);
  }
}
