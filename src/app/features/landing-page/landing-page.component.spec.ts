import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LandingPageComponent } from './landing-page.component';
import { ThemeService } from '../../core/services/theme.service';

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;
  let component: LandingPageComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ThemeService,
          useValue: {
            theme: signal<'light' | 'dark'>('light').asReadonly(),
            isDark: signal(false).asReadonly(),
            toggleTheme: jasmine.createSpy('toggleTheme')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('creates with seeded marketing content', () => {
    expect(component).toBeTruthy();
    expect(router).toBeTruthy();
    expect(component.features.length).toBe(4);
    expect(component.howItWorks.length).toBe(4);
    expect(component.plans.length).toBe(3);
    expect(component.faqs.length).toBe(4);
  });

  it('toggles the mobile menu state', () => {
    expect(component.isMenuOpen()).toBeFalse();

    component.toggleMenu();
    expect(component.isMenuOpen()).toBeTrue();

    component.toggleMenu();
    expect(component.isMenuOpen()).toBeFalse();
  });

  it('updates the scroll state from the window position', () => {
    const scrollYSpy = spyOnProperty(window, 'scrollY', 'get').and.returnValue(25);
    component.onWindowScroll();
    expect(component.isScrolled()).toBeTrue();

    scrollYSpy.and.returnValue(10);
    component.onWindowScroll();
    expect(component.isScrolled()).toBeFalse();
  });

  it('scrolls to a matching section and closes the menu', () => {
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    spyOn(document, 'getElementById').and.returnValue({
      scrollIntoView
    } as unknown as HTMLElement);
    component.isMenuOpen.set(true);

    component.scrollToSection('pricing');

    expect(document.getElementById).toHaveBeenCalledWith('pricing');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(component.isMenuOpen()).toBeFalse();
  });

  it('closes the menu even when a section is missing', () => {
    spyOn(document, 'getElementById').and.returnValue(null);
    component.isMenuOpen.set(true);

    component.scrollToSection('missing');

    expect(component.isMenuOpen()).toBeFalse();
  });

  it('toggles faq items open and closed', () => {
    component.toggleFaq(2);
    expect(component.activeFaq()).toBe(2);

    component.toggleFaq(2);
    expect(component.activeFaq()).toBeNull();
  });

  it('opens and closes modals while updating body overflow', () => {
    document.body.style.overflow = 'auto';

    component.openModal('privacy');
    expect(component.activeModal()).toBe('privacy');
    expect(document.body.style.overflow).toBe('hidden');

    component.closeModal();
    expect(component.activeModal()).toBeNull();
    expect(document.body.style.overflow).toBe('auto');
  });
});
