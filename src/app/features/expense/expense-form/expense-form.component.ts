import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService, Expense } from '../../../core/services/expense.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { RecurringService } from '../../../core/services/recurring.service';
import { toDateInputValue } from '../../../shared/utils/date.utils';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.css']
})
export class ExpenseFormComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private recurringService = inject(RecurringService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user = this.authService.currentUser;
  loading = signal<boolean>(false);
  categories = signal<Category[]>([]);

  expense: Expense = {
    userId: 0,
    categoryId: 0,
    title: '',
    amount: 0,
    currency: this.user()?.currency || 'INR',
    type: 'EXPENSE',
    paymentMethod: 'CASH',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurrencePeriod: 'MONTHLY'
  };

  ngOnInit() {
    this.loadCategories();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.expenseService.getExpenseById(id).subscribe(res => {
        if (res.success && res.data) {
          this.expense = res.data;
          
          // Format date string for input type="date"
          if (this.expense.date) {
            this.expense.date = toDateInputValue(this.expense.date);
          }
        }
      });
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      if (res.success) {
        // Only show expense categories
        this.categories.set(res.data.filter((c: Category) => c.type === 'EXPENSE'));
      }
    });
  }

  save() {
    if (!this.expense.title || !this.expense.amount || !this.expense.categoryId) return;
    
    this.loading.set(true);
    
    if (this.expense.expenseId) {
      this.expenseService.updateExpense(this.expense.expenseId, this.expense).subscribe({
        next: (res) => {
          if (res.success) this.router.navigate(['/expenses']);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.expenseService.addExpense(this.expense).subscribe({
        next: (res) => {
          if (res.success) {
            if (this.expense.isRecurring) {
              const recurringData = {
                userId: res.data.userId,
                categoryId: res.data.categoryId,
                title: res.data.title,
                amount: res.data.amount,
                type: 'EXPENSE',
                frequency: this.expense.recurrencePeriod || 'MONTHLY',
                startDate: res.data.date,
                nextDueDate: res.data.date,
                isActive: true,
                description: res.data.notes,
                skipFirstGeneration: true
              };
              this.recurringService.addRecurring(recurringData).subscribe(() => {
                this.router.navigate(['/expenses']);
              });
            } else {
              this.router.navigate(['/expenses']);
            }
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }
}
