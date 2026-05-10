import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-oauth-success',
  standalone: true,
  template: `<p>Logging you in...</p>`
})
export class OAuthSuccessComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionBase64 = urlParams.get('session');

    if (!sessionBase64) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      // decode base64
      const json = atob(sessionBase64.replaceAll('-', '+').replaceAll('_', '/'));
      const data = JSON.parse(json);

      // store tokens
      this.authService.setSession(data);

      // show success message if present
      if (data.message) {
        this.toastService.success(data.message);
      }

      // redirect to dashboard
      this.router.navigate(['/dashboard']);

    } catch (e) {
      console.error('OAuth decode failed', e);
      this.router.navigate(['/auth/login']);
    }
  }
}
