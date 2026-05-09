import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';

export interface CreateOrderRequest {
  userId: number;
  planName: string;
}

export interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createOrder(request: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/create-order`, request);
  }

  verifyPayment(request: VerifyPaymentRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/verify`, request);
  }

  startTrial(userId: number): Observable<ApiResponse<void>> {
    // We'll call auth-service directly for trial since it doesn't need payment
    return this.http.put<ApiResponse<void>>(`${environment.apiUrl}/auth/profile/upgrade`, null, {
      params: { userId: userId.toString(), planType: 'TRIAL', durationMonths: '0' }
    });
  }
}
