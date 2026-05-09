// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { premiumGuard } from './core/guards/premium.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Auth routes — lazy loaded, no JWT needed
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Protected routes — wrapped in MainLayout
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'expenses',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/expense/expense-list/expense-list.component').then(m => m.ExpenseListComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/expense/expense-form/expense-form.component').then(m => m.ExpenseFormComponent)
          }
        ]
      },
      {
        path: 'income',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/income/income-list/income-list.component').then(m => m.IncomeListComponent)
          },
          {
            path: 'add',
            loadComponent: () => import('./features/income/income-form/income-form.component').then(m => m.IncomeFormComponent)
          }
        ]
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/category/category-list/category-list.component').then(m => m.CategoryListComponent)
          },
          {
            path: 'add',
            loadComponent: () => import('./features/category/category-form/category-form.component').then(m => m.CategoryFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/category/category-form/category-form.component').then(m => m.CategoryFormComponent)
          }
        ]
      },
      {
        path: 'budgets',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/budget/budget-list/budget-list.component').then(m => m.BudgetListComponent)
          },
          {
            path: 'add',
            loadComponent: () => import('./features/budget/budget-form/budget-form.component').then(m => m.BudgetFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/budget/budget-form/budget-form.component').then(m => m.BudgetFormComponent)
          }
        ]
      },
      {
        path: 'analytics',
        canActivate: [premiumGuard],
        loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
      },
      {
        path: 'pricing',
        loadComponent: () => import('./features/subscriptions/pricing/pricing.component').then(m => m.PricingComponent)
      },
      {
        path: 'recurring',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/recurring/recurring-list/recurring-list.component').then(m => m.RecurringListComponent)
          },
          {
            path: 'add',
            loadComponent: () => import('./features/recurring/recurring-form/recurring-form.component').then(m => m.RecurringFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/recurring/recurring-form/recurring-form.component').then(m => m.RecurringFormComponent)
          },
          {
            path: 'calendar',
            loadComponent: () => import('./features/recurring/recurring-calendar/recurring-calendar.component').then(m => m.RecurringCalendarComponent)
          }
        ]
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notification-center/notification-center.component').then(m => m.NotificationCenterComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
        data: { role: 'ADMIN' }
      }
    ]
  },

  // Catch-all
  { path: '**', redirectTo: 'auth/login' }
];