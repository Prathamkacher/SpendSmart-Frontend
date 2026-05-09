import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Budget {
  budgetId?: number;
  userId?: number;
  categoryId: number;
  name: string;
  limitAmount: number;
  currency: string;
  period: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  startDate: string;
  endDate: string;
  spentAmount?: number;
  alertThreshold?: number;
  isActive?: boolean;
  
  // Calculated fields from backend
  progressPercentage?: number;
  remainingAmount?: number;
  status?: 'STABLE' | 'WARNING' | 'EXCEEDED';
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
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/budgets`;

  getBudgets(): Observable<ApiResponse<Budget[]>> {
    return this.http.get<ApiResponse<Budget[]>>(`${this.apiUrl}/user`);
  }

  getActiveBudgets(): Observable<ApiResponse<Budget[]>> {
    return this.http.get<ApiResponse<Budget[]>>(`${this.apiUrl}/active`);
  }

  getBudgetById(id: number): Observable<ApiResponse<Budget>> {
    return this.http.get<ApiResponse<Budget>>(`${this.apiUrl}/${id}`);
  }

  createBudget(budget: Budget): Observable<ApiResponse<Budget>> {
    return this.http.post<ApiResponse<Budget>>(this.apiUrl, budget);
  }

  updateBudget(id: number, budget: Budget): Observable<ApiResponse<Budget>> {
    return this.http.put<ApiResponse<Budget>>(`${this.apiUrl}/${id}`, budget);
  }

  deleteBudget(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  triggerReset(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset`, {});
  }
}
