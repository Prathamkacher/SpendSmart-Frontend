import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { BudgetListComponent } from './budget-list.component';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { createApiResponse } from '../../../../testing/test-helpers';

describe('BudgetListComponent', () => {
  let fixture: ComponentFixture<BudgetListComponent>;
  let component: BudgetListComponent;
  let budgetService: jasmine.SpyObj<BudgetService>;

  beforeEach(async () => {
    budgetService = jasmine.createSpyObj<BudgetService>('BudgetService', [
      'getActiveBudgets',
      'deleteBudget'
    ]);
    budgetService.getActiveBudgets.and.returnValue(
      of(
        createApiResponse([
          {
            budgetId: 1,
            categoryId: 2,
            name: 'Food',
            limitAmount: 5000,
            currency: 'INR',
            period: 'MONTHLY' as const,
            startDate: '2026-05-01',
            endDate: '2026-05-31',
            status: 'WARNING' as const
          }
        ])
      )
    );
    budgetService.deleteBudget.and.returnValue(of(createApiResponse(void 0)));

    await TestBed.configureTestingModule({
      imports: [BudgetListComponent, RouterTestingModule],
      providers: [
        { provide: BudgetService, useValue: budgetService },
        {
          provide: CategoryService,
          useValue: {
            getCategories: jasmine
              .createSpy('getCategories')
              .and.returnValue(of(createApiResponse([{ categoryId: 2, name: 'Food', type: 'EXPENSE' }])))
          }
        },
        {
          provide: AuthService,
          useValue: { currentUserValue: { currency: 'INR' }, currentUser: () => ({ currency: 'INR', planType: 'FREE' }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads budgets and categories on init', () => {
    expect(component.budgets().length).toBe(1);
    expect(component.categories().length).toBe(1);
  });

  it('deletes budgets after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteBudget(1);

    expect(budgetService.deleteBudget).toHaveBeenCalledWith(1);
    expect(budgetService.getActiveBudgets).toHaveBeenCalledTimes(2);
  });

  it('maps budget statuses to badge classes', () => {
    expect(component.getStatusClass('EXCEEDED')).toContain('rose');
    expect(component.getStatusClass('WARNING')).toContain('amber');
    expect(component.getStatusClass()).toContain('emerald');
  });
});
