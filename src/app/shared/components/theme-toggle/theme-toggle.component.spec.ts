import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let component: ThemeToggleComponent;
  let themeService: { toggleTheme: jasmine.Spy; isDark: any };

  beforeEach(async () => {
    themeService = {
      toggleTheme: jasmine.createSpy('toggleTheme'),
      isDark: signal(false).asReadonly()
    };

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: themeService as Partial<ThemeService> }]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('delegates theme changes to the service', () => {
    component.toggle();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });
});
