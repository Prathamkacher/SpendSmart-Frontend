import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ExpenseService, Expense } from '../../core/services/expense.service';
import { IncomeService } from '../../core/services/income.service';
import { BaseChartDirective } from 'ng2-charts';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ChartConfiguration, ChartData } from 'chart.js';
import { CategoryService, Category } from '../../core/services/category.service';
import { BudgetService } from '../../core/services/budget.service';
import { RecurringService } from '../../core/services/recurring.service';
import { PremiumOverlayComponent } from '../../shared/components/premium-overlay/premium-overlay.component';
import { MONTH_OPTIONS, buildYearRange } from '../../shared/utils/date.utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, RouterModule, PremiumOverlayComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private expenseService = inject(ExpenseService);
  private incomeService = inject(IncomeService);
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  private budgetService = inject(BudgetService);
  private themeService = inject(ThemeService);
  private recurringService = inject(RecurringService);

  user = this.authService.currentUser;
  expenses = signal<Expense[]>([]);
  totalSpent = signal<number>(0);
  totalIncome = signal<number>(0);
  loading = signal<boolean>(false);
  incomeChange = signal<number>(0);
  expenseChange = signal<number>(0);
  healthScore: any;
  topCategories: any[] = [];
  activeBudgets: any[] = [];
  categories = signal<Category[]>([]);
  categoriesMap = new Map<number, Category>();

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  months = MONTH_OPTIONS;
  years = buildYearRange(this.selectedYear);

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Income', backgroundColor: '#10b981', borderRadius: 8 },
      { data: [], label: 'Expenses', backgroundColor: '#f43f5e', borderRadius: 8 }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } }
    }
  };

  newExpense: Expense = this.resetExpense();

  constructor() {
    effect(() => {
      const isDark = this.themeService.isDark();
      this.updateChartOptions(isDark);
    });
  }

  updateChartOptions(isDark: boolean) {
    const textColor = isDark ? '#9ca3af' : '#64748b';
    const gridColor = isDark ? '#374151' : '#f1f5f9';

    this.barChartOptions = {
      ...this.barChartOptions,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 10 } }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } }
        }
      }
    };
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe();
    this.loadExpenses();
    this.loadTotal();
    this.loadIncomeTotal();
    this.loadAnalytics();
    this.loadQuickStats();

    // Manual fragment scrolling for non-window scrollable containers
    this.route.fragment.subscribe(frag => {
      if (frag === 'add-expense-form') {
        setTimeout(() => {
          const element = document.getElementById(frag);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500); // Wait for animations and rendering
      }
    });
  }

  loadQuickStats() {
    this.categoryService.getCategories().subscribe(res => {
      if (res.success) {
        this.categories.set(res.data);
        res.data.forEach((c: Category) => this.categoriesMap.set(c.categoryId!, c));
        const customCategories = res.data.filter((c: any) => !c.isDefault);
        this.topCategories = customCategories.slice(0, 2);
      }
    });
    this.budgetService.getActiveBudgets().subscribe(res => {
      if (res.success) {
        this.activeBudgets = res.data.slice(0, 3);
      }
    });
  }

  loadAnalytics() {
    const year = this.selectedYear;
    const month = this.selectedMonth;

    this.analyticsService.getHealthScore(year, month).subscribe(res => {
      if (res.success) this.healthScore = res.data;
    });

    this.analyticsService.getIncomeVsExpenseTrend(year).subscribe(res => {
      if (res.success && res.data) {
        const labels = Object.keys(res.data);
        const income = labels.map(l => res.data[l].income);
        const expenses = labels.map(l => res.data[l].expenses);
        const trendData = res.data;
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        const selectedMonthIndex = this.selectedMonth - 1;
        const currentMonthName = monthNames[selectedMonthIndex];
        const prevMonthName = selectedMonthIndex > 0 ? monthNames[selectedMonthIndex - 1] : null;

        const currData = trendData[currentMonthName] || { income: 0, expenses: 0 };
        const prevData = prevMonthName ? (trendData[prevMonthName] || { income: 0, expenses: 0 }) : { income: 0, expenses: 0 };

        // Only show the selected month in the graph
        const fullLabels: string[] = [currentMonthName];
        const fullIncome: number[] = [currData.income || 0];
        const fullExpenses: number[] = [currData.expenses || 0];

        // Calculate percentage changes
        const currInc = currData.income || 0;
        const prevInc = prevData.income || 0;
        if (prevInc > 0) {
          this.incomeChange.set(parseFloat(((currInc - prevInc) / prevInc * 100).toFixed(1)));
        } else {
          this.incomeChange.set(0);
        }
        
        const currExp = currData.expenses || 0;
        const prevExp = prevData.expenses || 0;
        if (prevExp > 0) {
          this.expenseChange.set(parseFloat(((currExp - prevExp) / prevExp * 100).toFixed(1)));
        } else {
          this.expenseChange.set(0);
        }

        this.barChartData = {
          labels: fullLabels,
          datasets: [
            { data: fullIncome, label: 'Income', backgroundColor: '#10b981', borderRadius: 4 },
            { data: fullExpenses, label: 'Expenses', backgroundColor: '#f43f5e', borderRadius: 4 }
          ]
        };
      }
    });
  }

  loadIncomeTotal() {
    const year = this.selectedYear;
    const month = this.selectedMonth;
    this.incomeService.getTotalByMonth(year, month).subscribe(res => {
      if (res.success) this.totalIncome.set(res.data || 0);
    });
  }

  loadExpenses() {
    const year = this.selectedYear;
    const month = this.selectedMonth;
    this.expenseService.getExpensesByMonth(year, month, 0, 2).subscribe(res => {
      if (res.success) this.expenses.set(res.data.content);
    });
  }

  loadTotal() {
    const year = this.selectedYear;
    const month = this.selectedMonth;
    this.expenseService.getTotalByMonth(year, month).subscribe(res => {
      if (res.success) this.totalSpent.set(res.data || 0);
    });
  }

  addExpense() {
    if (!this.newExpense.title || !this.newExpense.amount || !this.newExpense.categoryId) return;
    this.loading.set(true);
    this.expenseService.addExpense(this.newExpense).subscribe({
      next: (res) => {
        if (res.success) {
          if (this.newExpense.isRecurring) {
            const recurringData = {
              userId: res.data.userId,
              categoryId: res.data.categoryId,
              title: res.data.title,
              amount: res.data.amount,
              type: 'EXPENSE',
              frequency: this.newExpense.recurrencePeriod || 'MONTHLY',
              startDate: res.data.date,
              nextDueDate: res.data.date,
              isActive: true,
              description: res.data.notes
            };
            this.recurringService.addRecurring(recurringData).subscribe();
          }
          this.loadExpenses();
          this.loadTotal();
          this.loadAnalytics();
          this.newExpense = this.resetExpense();
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  deleteExpense(id: number) {
    if (confirm('Delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe(() => {
        this.loadExpenses();
        this.loadTotal();
        this.loadAnalytics();
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onCategoryChange(categoryId: number) {
    if (categoryId === -1) {
      this.router.navigate(['/categories/add']);
    }
  }

  isCategoryDropdownOpen = false;

  selectCategory(categoryId: number) {
    this.newExpense.categoryId = categoryId;
    this.isCategoryDropdownOpen = false;
    this.onCategoryChange(categoryId);
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  private resetExpense(): Expense {
    return {
      userId: 0,
      categoryId: 0, 
      title: '',
      amount: 0,
      currency: this.user()?.currency || 'INR',
      type: 'EXPENSE',
      paymentMethod: 'CASH',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false
    };
  }
  
  showHealthDetails = signal<boolean>(false);
  private healthHoverTimeout: any;

  onHealthMouseEnter() {
    this.healthHoverTimeout = setTimeout(() => {
      this.showHealthDetails.set(true);
    }, 2000);
  }

  onHealthMouseLeave() {
    if (this.healthHoverTimeout) {
      clearTimeout(this.healthHoverTimeout);
    }
    this.showHealthDetails.set(false);
  }

  getHealthTips() {
    const score = this.healthScore?.score || 0;
    if (score >= 80) return [
      "Keep saving 20% or more every month.",
      "Put your extra savings into investments.",
      "Look for more ways to cut small costs."
    ];
    if (score >= 60) return [
      "Try to spend 10% less on fun/wants.",
      "Check and cancel unused subscriptions.",
      "Save a bit more for emergencies."
    ];
    if (score >= 40) return [
      "Review your budget limits for this month.",
      "Cut back on small daily 'extras' and treats.",
      "Try to save at least 10% more of your income."
    ];
    return [
      "Buy only what you really need today.",
      "Lower your limits for top spending areas.",
      "Track every single penny you spend."
    ];
  }

  getHealthParameters() {
    return [
      { name: 'Money Saved', weight: '40%', desc: 'How much you keep vs spend' },
      { name: 'Stick to Budget', weight: '40%', desc: 'How well you follow your limits' },
      { name: 'Spend vs Earn', weight: '20%', desc: 'Overall spending balance' }
    ];
  }

  getCategoryIcon(categoryId?: number): string {
    return categoryId && this.categoriesMap.get(categoryId)?.icon ? this.categoriesMap.get(categoryId)!.icon! : '💳';
  }

  getCategoryName(categoryId?: number): string {
    return categoryId && this.categoriesMap.get(categoryId)?.name ? this.categoriesMap.get(categoryId)!.name : 'UNCATEGORIZED';
  }
  
  getCategoryColor(categoryId?: number): string {
    return categoryId && this.categoriesMap.get(categoryId)?.colorCode ? this.categoriesMap.get(categoryId)!.colorCode! : '#64748b';
  }

  onMonthYearChange() {
    this.loadExpenses();
    this.loadTotal();
    this.loadIncomeTotal();
    this.loadAnalytics();
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
