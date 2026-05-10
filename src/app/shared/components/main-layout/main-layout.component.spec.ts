import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';
import { mockUser } from '../../../../testing/test-helpers';

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let component: MainLayoutComponent;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout'], {
      currentUser: signal(mockUser).asReadonly()
    });

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, RouterTestingModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        {
          provide: NotificationService,
          useValue: {
            notifications: signal([]).asReadonly(),
            unreadCount: signal(0).asReadonly(),
            loadNotifications: jasmine.createSpy('loadNotifications'),
            markAllAsRead: jasmine.createSpy('markAllAsRead').and.returnValue(of(void 0)),
            markAsRead: jasmine.createSpy('markAsRead').and.returnValue(of({}))
          }
        },
        {
          provide: ThemeService,
          useValue: {
            isDark: signal(false).asReadonly(),
            toggleTheme: jasmine.createSpy('toggleTheme')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
  });

  it('toggles sidebar and mobile menu state', () => {
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBeFalse();

    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBeTrue();

    component.closeMobileMenu();
    expect(component.isMobileMenuOpen).toBeFalse();
  });

  it('logs out and redirects to the landing page', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('routes searches to the expense list', () => {
    component.onSearch({ target: { value: ' food ' } });
    expect(router.navigate).toHaveBeenCalledWith(['/expenses'], {
      queryParams: { q: 'food' }
    });
  });
});
