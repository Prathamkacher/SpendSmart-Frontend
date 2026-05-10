import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RecurringListComponent } from './recurring-list.component';
import { Category, CategoryService } from '../../../core/services/category.service';
import { RecurringService, RecurringTransaction } from '../../../core/services/recurring.service';
import { createApiResponse } from '../../../../testing/test-helpers';

describe('RecurringListComponent', () => {
  let component: RecurringListComponent;
  let fixture: ComponentFixture<RecurringListComponent>;
  let recurringService: jasmine.SpyObj<RecurringService>;
  let categoryService: jasmine.SpyObj<CategoryService>;

  const categories: Category[] = [
    { categoryId: 1, name: 'Food', type: 'EXPENSE', icon: '🍔', colorCode: '#ff0000' }
  ];
  const recurringTransactions: RecurringTransaction[] = [
    {
      recurringId: 10,
      userId: 7,
      categoryId: 1,
      title: 'Lunch',
      amount: 250,
      type: 'EXPENSE',
      frequency: 'MONTHLY',
      startDate: '2026-05-01',
      nextDueDate: '2026-05-20',
      isActive: true
    }
  ];

  beforeEach(async () => {
    recurringService = jasmine.createSpyObj<RecurringService>('RecurringService', [
      'getUserRecurring',
      'deactivateRecurring',
      'activateRecurring',
      'deleteRecurring'
    ]);
    categoryService = jasmine.createSpyObj<CategoryService>('CategoryService', ['getCategories']);

    recurringService.getUserRecurring.and.returnValue(of(createApiResponse(recurringTransactions)));
    recurringService.deactivateRecurring.and.returnValue(of(createApiResponse({} as any)));
    recurringService.activateRecurring.and.returnValue(of(createApiResponse({} as any)));
    recurringService.deleteRecurring.and.returnValue(of(createApiResponse(void 0)));
    categoryService.getCategories.and.returnValue(of(createApiResponse(categories)));

    await TestBed.configureTestingModule({
      imports: [RecurringListComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: RecurringService,
          useValue: recurringService
        },
        {
          provide: CategoryService,
          useValue: categoryService
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecurringListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads categories and recurring transactions on init', () => {
    expect(categoryService.getCategories).toHaveBeenCalled();
    expect(recurringService.getUserRecurring).toHaveBeenCalled();
    expect(component.recurringTxns()).toEqual(recurringTransactions);
    expect(component.categoriesMap.get(1)).toEqual(categories[0]);
    expect(component.loading()).toBeFalse();
  });

  it('deactivates a transaction and reloads the list when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.deactivate(10);

    expect(recurringService.deactivateRecurring).toHaveBeenCalledWith(10);
    expect(recurringService.getUserRecurring).toHaveBeenCalledTimes(2);
  });

  it('activates a transaction and reloads the list', () => {
    component.activate(10);

    expect(recurringService.activateRecurring).toHaveBeenCalledWith(10);
    expect(recurringService.getUserRecurring).toHaveBeenCalledTimes(2);
  });

  it('deletes a transaction and reloads when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteRecurring(10);

    expect(recurringService.deleteRecurring).toHaveBeenCalledWith(10);
    expect(recurringService.getUserRecurring).toHaveBeenCalledTimes(2);
  });

  it('does not deactivate or delete when confirmation is declined', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deactivate(10);
    component.deleteRecurring(10);

    expect(recurringService.deactivateRecurring).not.toHaveBeenCalled();
    expect(recurringService.deleteRecurring).not.toHaveBeenCalled();
  });

  it('returns category decorations with sensible fallbacks', () => {
    expect(component.getCategoryIcon(1)).toBe('🍔');
    expect(component.getCategoryColor(1)).toBe('#ff0000');
    expect(component.getCategoryIcon(999)).toBe('🔄');
    expect(component.getCategoryColor(999)).toBe('#64748b');
  });
});
