import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncomeService, Income } from '../../../core/services/income.service';
import { AuthService } from '../../../core/services/auth.service';

import { FormsModule } from '@angular/forms';
import { MONTH_OPTIONS, buildYearRange } from '../../../shared/utils/date.utils';

@Component({
  selector: 'app-income-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './income-list.component.html',
  styleUrls: ['./income-list.component.css']
})
export class IncomeListComponent implements OnInit {
  private incomeService = inject(IncomeService);
  private authService = inject(AuthService);

  user = this.authService.currentUser;
  incomes = signal<Income[]>([]);
  totalIncome = signal<number>(0);
  loading = signal<boolean>(false);

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  months = MONTH_OPTIONS;
  years = buildYearRange(this.selectedYear);

  ngOnInit(): void {
    this.loadIncomes();
    this.loadTotal();
  }

  loadIncomes() {
    this.loading.set(true);
    this.incomeService.getIncomesByMonth(this.selectedYear, this.selectedMonth, 0, 50).subscribe({
      next: (res) => {
        if (res.success) this.incomes.set(res.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadTotal() {
    this.incomeService.getTotalByMonth(this.selectedYear, this.selectedMonth).subscribe(res => {
      if (res.success) this.totalIncome.set(res.data || 0);
    });
  }

  onMonthYearChange() {
    this.loadIncomes();
    this.loadTotal();
  }

  deleteIncome(id: number) {
    if (confirm('Are you sure you want to delete this income record?')) {
      this.incomeService.deleteIncome(id).subscribe(res => {
        if (res.success) {
          this.loadIncomes();
          this.loadTotal();
        }
      });
    }
  }

  getSourceIcon(source: string): string {
    switch (source) {
      case 'SALARY': return 'work';
      case 'BUSINESS': return 'storefront';
      case 'INVESTMENT': return 'account_balance';
      default: return 'payments';
    }
  }
}
