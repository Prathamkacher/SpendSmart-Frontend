import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Router } from '@angular/router';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  private static readonly RAZORPAY_SCRIPT_ID = 'razorpay-checkout-script';
  private static readonly RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
  isYearly = false;
  currentPlan = 'FREE';
  isTrialUsed = false;
  userId: number | null = null;

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentPlan = user.planType;
      this.isTrialUsed = user.isTrialUsed;
      this.userId = user.userId;
    }
  }

  toggleBilling(): void {
    this.isYearly = !this.isYearly;
  }

  startTrial(): void {
    if (!this.userId) return;
    this.subscriptionService.startTrial(this.userId).subscribe({
      next: () => {
        this.authService.getProfile().subscribe(() => {
          this.ngZone.run(() => {
            this.router.navigate(['/dashboard']);
          });
        });
      }
    });
  }

  upgrade(): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const planName = this.isYearly ? 'YEARLY' : 'MONTHLY';
    this.subscriptionService.createOrder({ userId: this.userId, planName }).subscribe({
      next: async (order) => {
        const isScriptReady = await this.ensureRazorpayLoaded();
        if (isScriptReady) {
          this.openRazorpay(order, planName);
        }
      }
    });
  }

  private ensureRazorpayLoaded(): Promise<boolean> {
    if (window.Razorpay) {
      return Promise.resolve(true);
    }

    const existingScript = document.getElementById(PricingComponent.RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      return new Promise((resolve) => {
        existingScript.addEventListener('load', () => resolve(true), { once: true });
        existingScript.addEventListener('error', () => resolve(false), { once: true });
      });
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.id = PricingComponent.RAZORPAY_SCRIPT_ID;
      script.src = PricingComponent.RAZORPAY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  private openRazorpay(order: any, planName: string): void {
    const options = {
      key: order.keyId,
      amount: order.amount * 100,
      currency: order.currency,
      name: 'SpendSmart Pro',
      description: `Subscription for ${planName} Plan`,
      order_id: order.id,
      handler: (response: any) => {
        this.verifyPayment(response);
      },
      prefill: {
        name: this.authService.currentUser()?.fullName,
        email: this.authService.currentUser()?.email
      },
      theme: {
        color: '#16a34a'
      }
    };

    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      return;
    }

    const rzp = new Razorpay(options);
    rzp.open();
  }

  private verifyPayment(response: any): void {
    const request = {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
      userId: this.userId!
    };

    this.subscriptionService.verifyPayment(request).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.authService.getProfile().subscribe(() => {
            this.ngZone.run(() => {
              this.router.navigate(['/dashboard']);
            });
          });
        }
      }
    });
  }
}
