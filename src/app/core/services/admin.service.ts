import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlatformAnalytics {
  totalUsers: number;
  totalTransactions: number;
  totalExpenses: number;
  totalIncome: number;
  avgSpendingPerUser: number;
  userRegistrationTrend: { [key: string]: number };
}

export interface TransactionDTO {
  id: string;
  userId: number;
  userEmail: string;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  category: string;
  description: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/auth/admin`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`);
  }

  suspendUser(userId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/suspend`, {});
  }

  activateUser(userId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/activate`, {});
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`);
  }

  getTransactions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions`);
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }

  sendNotification(payload: { title: string; message: string; severity?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notify`, payload);
  }

  exportReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/report`, { responseType: 'blob' });
  }
}
