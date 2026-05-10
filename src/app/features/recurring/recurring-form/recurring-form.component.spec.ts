import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { RecurringFormComponent } from './recurring-form.component';
import { Category, CategoryService } from '../../../core/services/category.service';
import { RecurringService, RecurringTransaction } from '../../../core/services/recurring.service';
import { createApiResponse } from '../../../../testing/test-helpers';

describe('RecurringFormComponent', () => {
  let component: RecurringFormComponent;
  let fixture: ComponentFixture<RecurringFormComponent>;
  let recurringService: jasmine.SpyObj<RecurringService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let router: jasmine.SpyObj<Router>;
  let routeId: string | null;

  const categories: Category[] = [
    { categoryId: 1, name: 'Food', type: 'EXPENSE' },
    { categoryId: 2, name: 'Salary', type: 'INCOME' }
  ];

  const recurringTransaction: RecurringTransaction = {
    recurringId: 8,
    userId: 7,
    categoryId: 1,
    title: 'Rent',
    amount: 1500,
    type: 'EXPENSE',
    frequency: 'MONTHLY',
    startDate: '2026-05-01T00:00:00Z',
    endDate: '2026-12-01T00:00:00Z',
    nextDueDate: '2026-06-01T00:00:00Z',
    isActive: true,
    paymentMethod: 'BANK'
  };

  beforeEach(async () => {
    routeId = null;
    recurringService = jasmine.createSpyObj<RecurringService>('RecurringService', [
      'addRecurring',
      'getRecurringById',
      'updateRecurring'
    ]);
    categoryService = jasmine.createSpyObj<CategoryService>('CategoryService', ['getCategories']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    recurringService.addRecurring.and.returnValue(of(createApiResponse({} as any)));
    recurringService.getRecurringById.and.returnValue(of(createApiResponse(recurringTransaction)));
    recurringService.updateRecurring.and.returnValue(of(createApiResponse(recurringTransaction)));
    categoryService.getCategories.and.returnValue(of(createApiResponse(categories)));

    await TestBed.configureTestingModule({
      imports: [RecurringFormComponent, RouterTestingModule],
      providers: [
        {
          provide: RecurringService,
          useValue: recurringService
        },
        {
          provide: CategoryService,
          useValue: categoryService
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? routeId : null)
              }
            }
          }
        },
        { provide: Router, useValue: router }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecurringFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads categories on init', () => {
    expect(categoryService.getCategories).toHaveBeenCalled();
    expect(component.categories()).toEqual(categories);
  });

  it('loads a recurring transaction in edit mode and formats its dates', () => {
    routeId = '8';
    fixture = TestBed.createComponent(RecurringFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBeTrue();
    expect(recurringService.getRecurringById).toHaveBeenCalledWith(8);
    expect(component.recurring.startDate).toBe('2026-05-01');
    expect(component.recurring.endDate).toBe('2026-12-01');
  });

  it('clears loading when recurring fetch fails', () => {
    recurringService.getRecurringById.and.returnValue(throwError(() => new Error('boom')));
    routeId = '8';

    fixture = TestBed.createComponent(RecurringFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
  });

  it('filters categories by transaction type', () => {
    component.recurring.type = 'EXPENSE';
    expect(component.getFilteredCategories()).toEqual([categories[0]]);

    component.recurring.type = 'INCOME';
    expect(component.getFilteredCategories()).toEqual([categories[1]]);
  });

  it('creates a recurring transaction and normalizes the payload', () => {
    component.recurring = {
      ...component.recurring,
      title: 'Gym',
      userId: 7,
      categoryId: 1,
      amount: '49.99' as unknown as number,
      endDate: ''
    };

    component.onSubmit();

    expect(recurringService.addRecurring).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Gym',
        amount: 49.99,
        endDate: undefined
      })
    );
    expect(router.navigate).toHaveBeenCalledWith(['/recurring']);
    expect(component.loading()).toBeFalse();
  });

  it('updates an existing recurring transaction in edit mode', () => {
    component.isEditMode = true;
    component.recurring = {
      ...recurringTransaction,
      title: 'Updated Rent'
    };

    component.onSubmit();

    expect(recurringService.updateRecurring).toHaveBeenCalledWith(
      recurringTransaction.recurringId!,
      jasmine.objectContaining({ title: 'Updated Rent' })
    );
    expect(router.navigate).toHaveBeenCalledWith(['/recurring']);
    expect(component.loading()).toBeFalse();
  });

  it('clears loading when create fails', () => {
    recurringService.addRecurring.and.returnValue(throwError(() => new Error('boom')));
    component.recurring = {
      ...component.recurring,
      title: 'Gym',
      userId: 7,
      categoryId: 1,
      amount: 25
    };

    component.onSubmit();

    expect(component.loading()).toBeFalse();
  });
});
