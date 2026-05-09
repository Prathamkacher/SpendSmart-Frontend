// src/app/core/interceptors/api.interceptor.ts
import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ApiResponse } from '../models/auth.models';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const body = event.body as ApiResponse<any>;
        
        // If the backend returned success: true and it's a mutating request (POST, PUT, DELETE, PATCH)
        // Show the success message provided by the backend
        if (body && body.success && req.method !== 'GET') {
          if (body.message) {
            toastService.success(body.message);
          }
        }

        // If the backend returned success: false in a 200 OK (unlikely but possible)
        if (body && body.success === false) {
          toastService.error(body.message || 'An error occurred');
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.status === 0) {
        errorMessage = 'Connection lost. Is the backend running?';
      } else if (error.status >= 500) {
        errorMessage = 'Server is having trouble. Please try again later.';
      } else if (error.error && typeof error.error === 'object') {
        const apiResponse = error.error as ApiResponse<any>;
        errorMessage = apiResponse.message || errorMessage;

        // Handle validation errors (keep them short)
        if (
          apiResponse.data &&
          typeof apiResponse.data === 'object' &&
          apiResponse.message === 'Validation failed'
        ) {
          errorMessage = 'Please check the form for errors';
        }
      }

      // If the error message is still a massive block of text, truncate it
      if (errorMessage.length > 80) {
        errorMessage = 'A technical error occurred. Please refresh.';
      }

      toastService.error(errorMessage);
      return throwError(() => error);
    })
  );
};
