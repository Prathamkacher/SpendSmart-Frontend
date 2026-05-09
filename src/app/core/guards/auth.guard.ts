// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protects routes that require login.
 * Usage: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isLoggedIn() && authService.hasValidToken()) {
    return true;
  }

  // Redirect to login, preserve intended URL for post-login redirect
  router.navigate(['/auth/login']);
  return false;
};

/**
 * Prevents logged-in users from seeing login/register pages.
 * Usage: canActivate: [noAuthGuard]
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isLoggedIn() && authService.hasValidToken()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

/**
 * Protects admin-only routes.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};