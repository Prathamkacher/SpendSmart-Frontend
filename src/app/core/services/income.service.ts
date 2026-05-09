import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Income {
  incomeId?: number;
  userId?: number;
  categoryId?: number;
  title: string;
  amount: number;
  currency: string;
  source: 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'GIFT' | 'OTHER';
  date: string;
  notes?: string;
  isRecurring: boolean;
  recurrencePeriod?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
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
export class IncomeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/incomes`;

  getIncomes(page = 0, size = 20): Observable<ApiResponse<Page<Income>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<Income>>>(this.apiUrl, { params });
  }

  getIncomesByMonth(year: number, month: number, page = 0, size = 50): Observable<ApiResponse<Page<Income>>> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<Income>>>(`${this.apiUrl}/month`, { params });
  }

  getIncomeById(id: number): Observable<ApiResponse<Income>> {
    return this.http.get<ApiResponse<Income>>(`${this.apiUrl}/${id}`);
  }

  addIncome(income: Income): Observable<ApiResponse<Income>> {
    return this.http.post<ApiResponse<Income>>(this.apiUrl, income);
  }

  updateIncome(id: number, income: Income): Observable<ApiResponse<Income>> {
    return this.http.put<ApiResponse<Income>>(`${this.apiUrl}/${id}`, income);
  }

  deleteIncome(id: number): Observable<ApiResponse<void>> {
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

  getIncomesBySource(source: string, page = 0, size = 10): Observable<ApiResponse<Page<Income>>> {
    const params = new HttpParams()
      .set('source', source)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<Income>>>(`${this.apiUrl}/source`, { params });
  }
}
