import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="toggle()"
      class="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
             hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400
             focus:outline-none focus:ring-2 focus:ring-primary-500"
      [attr.title]="'Switch to ' + (themeService.isDark() ? 'light' : 'dark') + ' mode'"
      aria-label="Toggle theme"
    >
      <!-- Sun icon (to switch to light) -->
      <span *ngIf="themeService.isDark()" class="material-symbols-rounded text-[20px] animate-fade-in">
        light_mode
      </span>
      <!-- Moon icon (to switch to dark) -->
      <span *ngIf="!themeService.isDark()" class="material-symbols-rounded text-[20px] animate-fade-in">
        dark_mode
      </span>
    </button>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  toggle() {
    this.themeService.toggleTheme();
  }
}
