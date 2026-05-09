import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BudgetService, Budget } from '../../../core/services/budget.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { toDateInputValue } from '../../../shared/utils/date.utils';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css']
})
export class BudgetFormComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal<boolean>(false);
  loading = signal<boolean>(false);
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
