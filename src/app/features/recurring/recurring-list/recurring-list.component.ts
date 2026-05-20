import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecurringService, RecurringTransaction } from '../../../core/services/recurring.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { UserCurrencyPipe } from '../../../shared/pipes/user-currency.pipe';

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [CommonModule, RouterLink, UserCurrencyPipe],
  templateUrl: './recurring-list.component.html',
  styleUrls: ['./recurring-list.component.css']
})
export class RecurringListComponent implements OnInit {
  private recurringService = inject(RecurringService);
  private categoryService = inject(CategoryService);

  recurringTxns = signal<RecurringTransaction[]>([]);
  categoriesMap = new Map<number, Category>();
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCategories();
    this.loadRecurring();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      if (res.success) {
        res.data.forEach(cat => this.categoriesMap.set(cat.categoryId!, cat));
      }
    });
  }

  loadRecurring() {
    this.loading.set(true);
    this.recurringService.getUserRecurring().subscribe({
      next: (res) => {
        if (res.success) {
          this.recurringTxns.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  deactivate(id: number) {
    if (confirm('Are you sure you want to deactivate this recurring transaction?')) {
      this.recurringService.deactivateRecurring(id).subscribe(res => {
        if (res.success) this.loadRecurring();
      });
    }
  }

  activate(id: number) {
    this.recurringService.activateRecurring(id).subscribe(res => {
      if (res.success) this.loadRecurring();
    });
  }

  deleteRecurring(id: number) {
    if (confirm('Are you sure you want to completely delete this recurring transaction?')) {
      this.recurringService.deleteRecurring(id).subscribe(res => {
        if (res.success) this.loadRecurring();
      });
    }
  }

  getCategoryIcon(categoryId: number): string {
    return this.categoriesMap.get(categoryId)?.icon || '🔄';
  }

  getCategoryColor(categoryId: number): string {
    return this.categoriesMap.get(categoryId)?.colorCode || '#64748b'; // slate-500
  }
}
