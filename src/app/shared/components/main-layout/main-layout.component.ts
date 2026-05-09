import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent, NotificationBellComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  isSidebarOpen = true;
  isMobileMenuOpen = false;
  currentUser = this.authService.currentUser;

  navItems = [
    { label: 'Dashboard', icon: 'grid_view', route: '/dashboard' },
    { label: 'Analytics', icon: 'insights', route: '/analytics' },
    { label: 'Expenses', icon: 'payments', route: '/expenses' },
    { label: 'Income', icon: 'account_balance_wallet', route: '/income' },
    { label: 'Categories', icon: 'category', route: '/categories' },
    { label: 'Budgets', icon: 'savings', route: '/budgets' },
    { label: 'Recurring', icon: 'update', route: '/recurring' },
    { label: 'Notifications', icon: 'notifications', route: '/notifications' }
  ];

  constructor(private authService: AuthService, public router: Router) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onSearch(event: any) {
    const query = event.target.value;
    if (query && query.trim() !== '') {
      this.router.navigate(['/expenses'], { queryParams: { q: query.trim() } });
    } else {
      this.router.navigate(['/expenses']);
    }
  }
}
