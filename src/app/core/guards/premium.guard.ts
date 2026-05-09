import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const premiumGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.currentUser();
  
  if (user && (user.planType === 'PRO' || user.planType === 'TRIAL')) {
    return true;
  }
  
  // If FREE user, redirect to pricing with a return URL
  router.navigate(['/pricing'], { queryParams: { returnUrl: state.url } });
  return false;
};
