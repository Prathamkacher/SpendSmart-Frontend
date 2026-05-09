import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getMonthlySummary(year?: number, month?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/monthlySummary`, { params });
  }

  getYearlySummary(year?: number): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/yearlySummary`, { params });
  }

  getCategoryBreakdown(year?: number, month?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/categoryBreakdown`, { params });
  }

  getIncomeVsExpenseTrend(year?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/incomeVsExpense`, { params });
  }

  getSavingsRateTrend(year?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/savingsRate`, { params });
  }

  getTopCategories(limit: number = 5, year?: number, month?: number): Observable<ApiResponse<any[]>> {
    let params = new HttpParams().set('limit', limit.toString());
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/topCategories`, { params });
  }

  getForecast(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/forecast`);
  }

  getHealthScore(year?: number, month?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/healthScore`, { params });
  }

  getDailyExpenseTrend(year?: number, month?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/dailyTrend`, { params });
  }

  downloadMonthlyReport(year: number, month: number): Observable<Blob> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get(`${this.apiUrl}/reports/download`, {
      params,
      responseType: 'blob'
    });
  }
}
