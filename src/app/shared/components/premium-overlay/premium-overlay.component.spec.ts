import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PremiumOverlayComponent } from './premium-overlay.component';

describe('PremiumOverlayComponent', () => {
  let fixture: ComponentFixture<PremiumOverlayComponent>;
  let component: PremiumOverlayComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumOverlayComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PremiumOverlayComponent);
    component = fixture.componentInstance;
  });

  it('uses the default input values', () => {
    expect(component.showLock()).toBeTrue();
    expect(component.variant()).toBe('default');
  });

  it('accepts explicit input overrides', () => {
    fixture.componentRef.setInput('showLock', false);
    fixture.componentRef.setInput('variant', 'dashboard');
    fixture.detectChanges();

    expect(component.showLock()).toBeFalse();
    expect(component.variant()).toBe('dashboard');
  });
});
