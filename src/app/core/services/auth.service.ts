// src/app/core/services/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, RegisterRequest, AuthResponse,
  ApiResponse, UserProfile, ChangePasswordRequest,
  UpdateProfileRequest, RefreshTokenRequest
} from '../models/auth.models';
import { ToastService } from './toast.service';
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Angular signals for reactive state â€” components subscribe automatically
  private _currentUser = signal<UserProfile | null>(this.loadUserFromStorage());
  private _isLoading   = signal<boolean>(false);

  // Public readable signals
  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoading    = this._isLoading.asReadonly();
  readonly isLoggedIn   = computed(() => this._currentUser() !== null);
  readonly isAdmin      = computed(() => this._currentUser()?.role === 'ADMIN');

  get currentUserValue(): UserProfile | null {
    return this._currentUser();
  }

  constructor(
    private toast: ToastService,
    private http: HttpClient,
    private router: Router
  ) {}
  setSession(data: any) {
    localStorage.setItem('accessToken',  data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user',         JSON.stringify(data.user));
    this._currentUser.set(data.user);
  }

  updateCurrentUser(user: UserProfile): void {
    this._currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // â”€â”€ REGISTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    this._isLoading.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/register`, request
    ).pipe(
      tap(res  => { this.handleAuthSuccess(res.data); this._isLoading.set(false); }),
      catchError(err => { this._isLoading.set(false); return throwError(() => err); })
    );
  }

  // â”€â”€ LOGIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    this._isLoading.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/login`, request
    ).pipe(
      tap(res  => { this.handleAuthSuccess(res.data); this._isLoading.set(false); }),
      catchError(err => { this._isLoading.set(false); return throwError(() => err); })
    );
  }

  // â”€â”€ LOGOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  logout(): void {
    this.toast.success('Logged out successfully');
    this.clearSession();
  }






  // â”€â”€ REFRESH TOKEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.getRefreshToken();
    const body: RefreshTokenRequest = { refreshToken: refreshToken! };
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/refresh`, body
    ).pipe(
      tap(res => this.handleAuthSuccess(res.data))
    );
  }

  // â”€â”€ GET PROFILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`).pipe(
      tap(res => {
        this._currentUser.set(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
    );
  }

  // â”€â”€ UPDATE PROFILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(
      `${this.apiUrl}/profile`, request
    ).pipe(
      tap(res => {
        this._currentUser.set(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
    );
  }

  // â”€â”€ CHANGE PASSWORD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/password`, request);
  }

  // --- Password Reset Flow ---

  requestPasswordReset(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyResetOtp(email: string, otp: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, { email, otp, newPassword });
  }

  // â”€â”€ Token helpers (used by JWT interceptor) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      // Decode payload to check expiry (no library needed)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // â”€â”€ Private helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private handleAuthSuccess(data: AuthResponse): void {
    localStorage.setItem('accessToken',  data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user',         JSON.stringify(data.user));
    this._currentUser.set(data.user);
    
    // Redirect based on role
    if (data.user.role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this.router.navigate(['/']);
  }

  getUserEmail(): string | null {
    return this._currentUser()?.email || null;
  }

  private loadUserFromStorage(): UserProfile | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
}
