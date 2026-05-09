import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RecurringService, RecurringTransaction } from '../../../core/services/recurring.service';
import { CategoryService, Category } from '../../../core/services/category.service';

@Component({
  selector: 'app-recurring-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recurring-form.component.html',
  styleUrls: ['./recurring-form.component.css']
})
export class RecurringFormComponent implements OnInit {
  private recurringService = inject(RecurringService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  loading = signal<boolean>(false);
  categories = signal<Category[]>([]);

  // Default values
  recurring: Partial<RecurringTransaction> = {
    type: 'EXPENSE',
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CARD',
    amount: 0
  };

  ngOnInit(): void {
    this.loadCategories();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.loadRecurring(Number(idParam));
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      if (res.success) this.categories.set(res.data);
    });
  }

  loadRecurring(id: number) {
    this.loading.set(true);
    this.recurringService.getRecurringById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.recurring = { ...res.data };
          // Format dates for input fields
          if (this.recurring.startDate) {
            this.recurring.startDate = this.recurring.startDate.split('T')[0];
          }
          if (this.recurring.endDate) {
            this.recurring.endDate = this.recurring.endDate.split('T')[0];
          }
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getFilteredCategories() {
    return this.categories().filter(c => c.type === this.recurring.type);
  }

  onSubmit() {
    this.loading.set(true);
    
    // Ensure numeric amount
    if (typeof this.recurring.amount === 'string') {
      this.recurring.amount = parseFloat(this.recurring.amount);
    }
    
    // Convert empty string to undefined for endDate
    if (!this.recurring.endDate) {
      this.recurring.endDate = undefined;
    }

    if (this.isEditMode && this.recurring.recurringId) {
      this.recurringService.updateRecurring(this.recurring.recurringId, this.recurring).subscribe({
        next: (res) => {
          if (res.success) this.router.navigate(['/recurring']);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.recurringService.addRecurring(this.recurring).subscribe({
        next: (res) => {
          if (res.success) this.router.navigate(['/recurring']);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }
}
