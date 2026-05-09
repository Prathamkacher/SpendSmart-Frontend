import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { BudgetFormComponent } from './budget-form.component';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { createApiResponse } from '../../../../testing/test-helpers';

describe('BudgetFormComponent', () => {
  let fixture: ComponentFixture<BudgetFormComponent>;
  let component: BudgetFormComponent;
  let budgetService: jasmine.SpyObj<BudgetService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    budgetService = jasmine.createSpyObj<BudgetService>('BudgetService', [
      'getBudgetById',
      'createBudget',
      'updateBudget'
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    budgetService.createBudget.and.returnValue(of(createApiResponse({} as any)));
    budgetService.updateBudget.and.returnValue(of(createApiResponse({} as any)));

    await TestBed.configureTestingModule({
      imports: [BudgetFormComponent, RouterTestingModule],
      providers: [
        { provide: BudgetService, useValue: budgetService },
        { provide: Router, useValue: router },
        {
          provide: CategoryService,
          useValue: {
            getCategoriesByType: jasmine
              .createSpy('getCategoriesByType')
              .and.returnValue(of(createApiResponse([{ categoryId: 2, name: 'Food', type: 'EXPENSE' }])))
          }
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: {} } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('defaults the category when creating a new budget', () => {
    expect(component.categories().length).toBe(1);
    expect(component.budget.categoryId).toBe(2);
  });

  it('does not save invalid budgets', () => {
    component.budget.name = '';
    component.budget.limitAmount = 0;
    component.save();

    expect(budgetService.createBudget).not.toHaveBeenCalled();
  });

  it('creates a budget and navigates to the list', () => {
    component.budget.name = 'Food';
    component.budget.limitAmount = 5000;
    component.save();

    expect(budgetService.createBudget).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/budgets']);
  });
});
