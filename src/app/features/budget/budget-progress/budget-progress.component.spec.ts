import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetProgressComponent } from './budget-progress.component';

describe('BudgetProgressComponent', () => {
  let fixture: ComponentFixture<BudgetProgressComponent>;
  let component: BudgetProgressComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetProgressComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetProgressComponent);
    component = fixture.componentInstance;
  });

  it('renders the percentage and caps width at 100%', () => {
    component.label = 'Budget Used';
    component.percentage = 120;
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('120%');
    expect(host.querySelector('div[style]')?.getAttribute('style')).toContain('width: 100%');
  });
});
