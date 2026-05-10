import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ThemeService } from '../../core/services/theme.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerList', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class LandingPageComponent {
  private themeService = inject(ThemeService);
  private router = inject(Router);

  isMenuOpen = signal<boolean>(false);
  isScrolled = signal<boolean>(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.isMenuOpen.set(false);
  }

  features = [
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Smart Analytics',
      desc: 'Visualize your spending habits with interactive charts and AI-driven insights.'
    },
    {
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Budget Management',
      desc: 'Set category-wise limits and get real-time alerts when you\'re close to your limit.'
    },
    {
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      title: 'Automation',
      desc: 'Schedule recurring transactions and let SpendSmart handle the rest automatically.'
    },
    {
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      title: 'Smart Alerts',
      desc: 'Stay informed with instant notifications about your bills, budgets, and subscriptions.'
    }
  ];

  howItWorks = [
    { step: '01', title: 'Connect Account', desc: 'Securely sign up and set up your profile in seconds.' },
    { step: '02', title: 'Track Spending', desc: 'Add transactions manually or use our smart automation.' },
    { step: '03', title: 'Set Budgets', desc: 'Define your limits and watch your savings grow.' },
    { step: '04', title: 'Gain Insights', desc: 'Understand exactly where your money goes with AI reports.' }
  ];

  plans = [
    { name: 'Free', price: '0', features: ['Basic Analytics', '5 Categories', 'Manual Tracking', 'Mobile App'], cta: 'Get Started', highlight: false },
    { name: 'Pro Monthly', price: '539', features: ['Advanced AI Analytics', 'Unlimited Categories', 'Auto-Automation', 'Priority Support', 'Cloud Sync'], cta: 'Choose Pro', highlight: true, discount: '10% Off' },
    { name: 'Pro Yearly', price: '5031', features: ['Everything in Pro', '30% Discount applied', 'Family Sharing', 'Custom Reports'], cta: 'Save 30% Now', highlight: false }
  ];

  faqs = [
    { q: 'Is SpendSmart free to use?', a: 'Yes! Our basic plan is free forever. For advanced features, you can upgrade to a Pro plan at any time.' },
    { q: 'How secure is my data?', a: 'We use industry-standard JWT authentication and bank-grade encryption to ensure your data is always safe.' },
    { q: 'Can I track recurring expenses?', a: 'Absolutely. You can set up daily, weekly, monthly, or yearly recurring transactions easily.' },
    { q: 'Does it support multi-device sync?', a: 'Yes, your data is synced in real-time across all your devices once you sign in.' }
  ];

  activeFaq = signal<number | null>(null);
  activeModal = signal<'privacy' | 'terms' | null>(null);

  toggleFaq(index: number) {
    this.activeFaq.update(v => v === index ? null : index);
  }

  openModal(type: 'privacy' | 'terms') {
    this.activeModal.set(type);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.activeModal.set(null);
    document.body.style.overflow = 'auto';
  }
}
