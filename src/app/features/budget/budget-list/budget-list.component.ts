import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BudgetService, Budget } from '../../../core/services/budget.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { BudgetProgressComponent } from '../budget-progress/budget-progress.component';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BudgetProgressComponent],
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.css']
})
export class BudgetListComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);

  budgets = signal<Budget[]>([]);
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.loadCategories();
    this.loadBudgets();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      if (res.success) this.categories.set(res.data);
    });
  }

  loadBudgets() {
    this.budgetService.getActiveBudgets().subscribe(res => {
      if (res.success) this.budgets.set(res.data);
    });
  }

  getCategory(id: number) {
    return this.categories().find(c => c.categoryId === id);
  }

  deleteBudget(id: number) {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgetService.deleteBudget(id).subscribe(res => {
        if (res.success) this.loadBudgets();
      });
    }
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'EXCEEDED': return 'bg-rose-50 text-rose-600';
      case 'WARNING': return 'bg-amber-50 text-amber-600';
      default: return 'bg-emerald-50 text-emerald-600';
    }
  }
}
