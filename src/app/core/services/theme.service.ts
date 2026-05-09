import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'spendsmart-theme';
  
  // State
  theme = signal<Theme>('system');
  isDark = signal<boolean>(false);

  constructor() {
    this.initTheme();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.theme() === 'system') {
        this.applyTheme(e.matches);
      }
    });

    // Effect to persist theme and apply it
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem(this.THEME_KEY, currentTheme);
      
      if (currentTheme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.applyTheme(systemDark);
      } else {
        this.applyTheme(currentTheme === 'dark');
      }
    }, { allowSignalWrites: true });
  }

  private initTheme() {
    const storedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (storedTheme) {
      this.theme.set(storedTheme);
    } else {
      this.theme.set('system');
    }
  }

  private applyTheme(isDark: boolean) {
    this.isDark.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(newTheme: Theme) {
    this.theme.set(newTheme);
  }

  toggleTheme() {
    const current = this.theme();
    // If it's currently system, we toggle to whatever it ISN'T right now
    if (current === 'system') {
      this.setTheme(this.isDark() ? 'light' : 'dark');
    } else {
      this.setTheme(current === 'light' ? 'dark' : 'light');
    }
  }
}
