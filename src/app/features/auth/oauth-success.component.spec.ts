import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OAuthSuccessComponent } from './oauth-success.component';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

describe('OAuthSuccessComponent', () => {
  let component: OAuthSuccessComponent;
  let fixture: ComponentFixture<OAuthSuccessComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['setSession']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success']);
    spyOn(console, 'error');

    await TestBed.configureTestingModule({
      imports: [OAuthSuccessComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OAuthSuccessComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login if no session param', () => {
    window.history.pushState({}, '', '/'); 
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should process session and navigate to dashboard', () => {
    const mockData = {
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { id: 1 },
      message: 'Login successful'
    };
    const jsonStr = JSON.stringify(mockData);
    const base64Str = btoa(jsonStr).replace(/\+/g, '-').replace(/\//g, '_');
    
    window.history.pushState({}, '', `?session=${base64Str}`);
    
    fixture.detectChanges();
    
    expect(authServiceSpy.setSession).toHaveBeenCalledWith(mockData);
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Login successful');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to login on decode error', () => {
    window.history.pushState({}, '', '?session=invalid-base64');
    
    fixture.detectChanges();
    
    expect(authServiceSpy.setSession).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
