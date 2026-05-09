import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecurringTransaction {
  recurringId?: number;
  userId: number;
  categoryId: number;
  title: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  isActive: boolean;
  description?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'BANK' | 'WALLET';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecurringService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recurring`;

  addRecurring(data: any): Observable<ApiResponse<RecurringTransaction>> {
    return this.http.post<ApiResponse<RecurringTransaction>>(this.apiUrl, data);
  }

  getUserRecurring(): Observable<ApiResponse<RecurringTransaction[]>> {
    return this.http.get<ApiResponse<RecurringTransaction[]>>(`${this.apiUrl}/user`);
  }

  getActiveRecurring(): Observable<ApiResponse<RecurringTransaction[]>> {
    return this.http.get<ApiResponse<RecurringTransaction[]>>(`${this.apiUrl}/active`);
  }

  getRecurringById(id: number): Observable<ApiResponse<RecurringTransaction>> {
    return this.http.get<ApiResponse<RecurringTransaction>>(`${this.apiUrl}/${id}`);
  }

  updateRecurring(id: number, data: any): Observable<ApiResponse<RecurringTransaction>> {
    return this.http.put<ApiResponse<RecurringTransaction>>(`${this.apiUrl}/${id}`, data);
  }

  deactivateRecurring(id: number): Observable<ApiResponse<RecurringTransaction>> {
    return this.http.put<ApiResponse<RecurringTransaction>>(`${this.apiUrl}/deactivate/${id}`, {});
  }

  activateRecurring(id: number): Observable<ApiResponse<RecurringTransaction>> {
    return this.http.put<ApiResponse<RecurringTransaction>>(`${this.apiUrl}/activate/${id}`, {});
  }

  deleteRecurring(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
