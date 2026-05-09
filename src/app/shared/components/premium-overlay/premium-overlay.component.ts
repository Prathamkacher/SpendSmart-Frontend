import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-premium-overlay',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './premium-overlay.component.html',
  styleUrls: ['./premium-overlay.component.css']
})
export class PremiumOverlayComponent {
  readonly showLock = input(true);
  readonly variant = input<'default' | 'dashboard'>('default');
}
