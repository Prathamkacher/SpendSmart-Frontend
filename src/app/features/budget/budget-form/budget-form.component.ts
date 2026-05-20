import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BudgetService, Budget } from '../../../core/services/budget.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { toDateInputValue } from '../../../shared/utils/date.utils';
import { UserCurrencySymbolPipe } from '../../../shared/pipes/user-currency-symbol.pipe';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UserCurrencySymbolPipe],
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css']
})
export class BudgetFormComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal<boolean>(false);
  loading = signal<boolean>(false);
  showLimitModal = signal<boolean>(false);
  categories = signal<Category[]>([]);
  
  budget: Budget = {
    name: '',
    categoryId: 0,
    limitAmount: 0,
    currency: 'INR',
    period: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    alertThreshold: 80
  };

  ngOnInit() {
    this.loadCategories();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit.set(true);
      this.budgetService.getBudgetById(id).subscribe(res => {
        if (res.success) {
          this.budget = res.data;
          this.budget.startDate = toDateInputValue(this.budget.startDate);
          this.budget.endDate = toDateInputValue(this.budget.endDate);
        }
      });
    }
  }

  loadCategories() {
    this.categoryService.getCategoriesByType('EXPENSE').subscribe(res => {
      if (res.success) {
        this.categories.set(res.data);
        if (!this.isEdit() && res.data.length > 0) {
          this.budget.categoryId = res.data[0].categoryId!;
        }
      }
    });
  }

  save() {
    if (!this.budget.name || this.budget.limitAmount <= 0) return;

    if (!this.isEdit() && this.authService.currentUser()?.planType === 'FREE') {
      this.loading.set(true);
      this.budgetService.getActiveBudgets().subscribe({
        next: (res) => {
          this.loading.set(false);
          const activeCount = res.data ? res.data.length : 0;
          if (activeCount >= 3) {
            this.showLimitModal.set(true);
            this.toastService.show('Limit reached! Buy premium to create unlimited budgets.', 'warning');
            return;
          }
          this.proceedSave();
        },
        error: () => {
          this.loading.set(false);
          this.proceedSave();
        }
      });
    } else {
      this.proceedSave();
    }
  }

  private proceedSave() {
    this.loading.set(true);
    const obs = this.isEdit() 
      ? this.budgetService.updateBudget(this.budget.budgetId!, this.budget)
      : this.budgetService.createBudget(this.budget);

    obs.subscribe({
      next: (res) => {
        if (res.success) this.router.navigate(['/budgets']);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
