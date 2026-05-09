import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  currency: string;
  timezone: string;
  avatarUrl: string;
  bio?: string;
  provider: string;
  role: string;
  isActive: boolean;
  monthlyBudget: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: Partial<UserProfile>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, profileData).pipe(
      tap(res => {
        if (res.success) {
          // Update the user info in AuthService to sync the UI
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            this.authService.updateCurrentUser({
              ...currentUser,
              fullName: res.data.fullName,
              avatarUrl: res.data.avatarUrl
            });
          }
        }
      })
    );
  }
}
