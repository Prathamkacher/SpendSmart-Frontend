import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService, Expense } from '../../../core/services/expense.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { MONTH_OPTIONS, buildYearRange } from '../../../shared/utils/date.utils';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);

  user = this.authService.currentUser;
  expenses = signal<Expense[]>([]);
  allExpenses: Expense[] = [];
  categoriesMap = new Map<number, Category>();
  totalSpent = signal<number>(0);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  months = MONTH_OPTIONS;
  years = buildYearRange(this.selectedYear);

  ngOnInit(): void {
    this.loadCategories();
    this.loadExpenses();
    this.loadTotal();

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery.set(params['q'].toLowerCase());
        this.applyFilter();
      } else {
        this.searchQuery.set('');
        this.applyFilter();
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      if (res.success) {
        res.data.forEach(cat => {
          this.categoriesMap.set(cat.categoryId!, cat);
        });
      }
    });
  }

  loadExpenses() {
    this.loading.set(true);
    const year = this.selectedYear;
    const month = this.selectedMonth;
    this.expenseService.getExpensesByMonth(year, month, 0, 50).subscribe({
      next: (res) => {
        if (res.success) {
          this.allExpenses = res.data.content;
          this.applyFilter();
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter() {
    const query = this.searchQuery();
    if (query) {
      this.expenses.set(this.allExpenses.filter(e => e.title.toLowerCase().includes(query)));
    } else {
      this.expenses.set(this.allExpenses);
    }
  }

  loadTotal() {
    const year = this.selectedYear;
    const month = this.selectedMonth;
    this.expenseService.getTotalByMonth(year, month).subscribe(res => {
      if (res.success) this.totalSpent.set(res.data);
    });
  }

  deleteExpense(id: number) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe(res => {
        if (res.success) {
          this.loadExpenses();
          this.loadTotal();
        }
      });
    }
  }

  getPaymentIcon(method: string): string {
    switch (method) {
      case 'CARD': return 'credit_card';
      case 'CASH': return 'payments';
      case 'UPI': return 'account_balance_wallet';
      default: return 'receipt_long';
    }
  }

  getCategoryIcon(categoryId: number): string {
    const cat = this.categoriesMap.get(categoryId);
    return cat?.icon || '💳';
  }

  getCategoryName(categoryId: number): string {
    const cat = this.categoriesMap.get(categoryId);
    return cat?.name || 'Uncategorized';
  }

  canEdit(createdAt: string | undefined): boolean {
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const hoursDifference = (now - created) / (1000 * 60 * 60);
    return hoursDifference <= 12;
  }

  onMonthYearChange() {
    this.loadExpenses();
    this.loadTotal();
  }
}
