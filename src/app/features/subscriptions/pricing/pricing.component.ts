import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Router } from '@angular/router';

declare var Razorpay: any;

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
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
      next: (order) => {
        this.openRazorpay(order, planName);
      }
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
