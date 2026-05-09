import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IncomeService, Income } from '../../../core/services/income.service';
import { AuthService } from '../../../core/services/auth.service';
import { RecurringService } from '../../../core/services/recurring.service';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 flex items-center justify-center transition-colors duration-500">
      <div class="max-w-xl w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 p-10 space-y-8 animate-in zoom-in-95 duration-500">
        
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Add Income</h1>
          <a routerLink="/income" class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cancel</a>
        </div>

        <form [formGroup]="incomeForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Income Title</label>
            <input formControlName="title" type="text" placeholder="e.g. Monthly Salary"
                   class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-indigo-500 dark:text-white dark:placeholder-gray-500 transition-all">
            @if (incomeForm.get('title')?.touched && incomeForm.get('title')?.invalid) {
              <p class="text-xs text-red-500 dark:text-red-400">Title is required (max 100 chars)</p>
            }
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Amount</label>
              <input formControlName="amount" type="number" step="0.01"
                     class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-indigo-500 dark:text-white transition-all">
              @if (incomeForm.get('amount')?.touched && incomeForm.get('amount')?.invalid) {
                <p class="text-xs text-red-500 dark:text-red-400">Positive amount is required</p>
              }
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Source</label>
              <select formControlName="source" 
                      class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-indigo-500 dark:text-white transition-all">
                <option value="SALARY">Salary</option>
                <option value="FREELANCE">Freelance</option>
                <option value="BUSINESS">Business</option>
                <option value="INVESTMENT">Investment</option>
                <option value="GIFT">Gift</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Date</label>
            <input formControlName="date" type="date"
                   class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-indigo-500 dark:text-white transition-all">
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Notes (Optional)</label>
            <textarea formControlName="notes" rows="3" placeholder="Add some details..."
                      class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-indigo-500 dark:text-white dark:placeholder-gray-500 transition-all"></textarea>
          </div>

          <div class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <input formControlName="isRecurring" type="checkbox" id="isRecurring" class="w-5 h-5 text-primary-600 dark:text-indigo-500 rounded">
            <label for="isRecurring" class="text-sm font-bold text-gray-700 dark:text-gray-300">This is a recurring income</label>
          </div>

          @if (incomeForm.get('isRecurring')?.value) {
            <div class="space-y-2 animate-in slide-in-from-top-2">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Recurrence Period</label>
              <select formControlName="recurrencePeriod" 
                      class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-indigo-500 dark:text-white transition-all">
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY" selected>Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          }

          <button type="submit" [disabled]="incomeForm.invalid || loading"
                  class="w-full p-5 bg-primary-600 dark:bg-indigo-600 text-white font-bold rounded-2xl hover:bg-primary-700 dark:hover:bg-indigo-500 transition-all shadow-lg disabled:opacity-50">
            {{ loading ? 'Saving...' : 'Add Income' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .text-primary-600 { color: #16a34a; }
    .bg-primary-600 { background-color: #16a34a; }
    .bg-primary-700:hover { background-color: #15803d; }
    .focus\\:ring-primary-500:focus { --tw-ring-color: #16a34a; }
  `]
})
export class IncomeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private incomeService = inject(IncomeService);
  private authService = inject(AuthService);
  private recurringService = inject(RecurringService);
  private router = inject(Router);

  incomeForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    source: ['SALARY', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    notes: ['', Validators.maxLength(500)],
    isRecurring: [false],
    recurrencePeriod: ['MONTHLY'],
    currency: ['INR']
  });

  loading = false;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.currency) {
      this.incomeForm.patchValue({ currency: user.currency });
    }
  }

  onSubmit() {
    if (this.incomeForm.valid) {
      this.loading = true;
      const formData = this.incomeForm.value;
      
      this.incomeService.addIncome(formData).subscribe({
        next: (res) => {
          if (res.success) {
            if (formData.isRecurring) {
              const recurringData = {
                userId: res.data.userId,
                categoryId: res.data.categoryId || 1,
                title: formData.title,
                amount: formData.amount,
                type: 'INCOME',
                frequency: formData.recurrencePeriod,
                startDate: formData.date,
                nextDueDate: formData.date,
                isActive: true,
                description: formData.notes
              };
              this.recurringService.addRecurring(recurringData).subscribe(() => {
                this.router.navigate(['/income']);
              });
            } else {
              this.router.navigate(['/income']);
            }
          }
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }
}
