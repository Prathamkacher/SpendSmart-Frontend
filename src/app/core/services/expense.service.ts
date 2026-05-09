import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expense {
  expenseId?: number;
  userId: number;
  categoryId: number;
  title: string;
  amount: number;
  currency: string;
  type: 'EXPENSE' | 'SPLIT';
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK' | 'WALLET';
  date: string;
  notes?: string;
  isRecurring: boolean;
  recurrencePeriod?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses`;

  getExpenses(page = 0, size = 20): Observable<ApiResponse<Page<Expense>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<Expense>>>(this.apiUrl, { params });
  }

  getExpensesByMonth(year: number, month: number, page = 0, size = 50): Observable<ApiResponse<Page<Expense>>> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<Expense>>>(`${this.apiUrl}/month`, { params });
  }

  addExpense(expense: Expense): Observable<ApiResponse<Expense>> {
    return this.http.post<ApiResponse<Expense>>(this.apiUrl, expense);
  }

  getExpenseById(id: number): Observable<ApiResponse<Expense>> {
    return this.http.get<ApiResponse<Expense>>(`${this.apiUrl}/${id}`);
  }

  updateExpense(id: number, expense: Expense): Observable<ApiResponse<Expense>> {
    return this.http.put<ApiResponse<Expense>>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getTotal(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/total/user`);
  }

  getTotalByMonth(year: number, month: number): Observable<ApiResponse<number>> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/total/month`, { params });
  }
}
