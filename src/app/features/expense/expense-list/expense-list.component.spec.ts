import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { ExpenseListComponent } from './expense-list.component';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { createApiResponse, mockUser } from '../../../../testing/test-helpers';

describe('ExpenseListComponent', () => {
  let fixture: ComponentFixture<ExpenseListComponent>;
  let component: ExpenseListComponent;
  let queryParams$: Subject<Record<string, string>>;
  let expenseService: jasmine.SpyObj<ExpenseService>;

  beforeEach(async () => {
    queryParams$ = new Subject<Record<string, string>>();
    expenseService = jasmine.createSpyObj<ExpenseService>('ExpenseService', [
      'getExpensesByMonth',
      'getTotalByMonth',
      'deleteExpense'
    ]);
    expenseService.getExpensesByMonth.and.returnValue(
      of(
        createApiResponse({
          content: [
            {
              expenseId: 1,
              userId: 7,
              categoryId: 2,
              title: 'Groceries',
              amount: 1000,
              currency: 'INR',
              type: 'EXPENSE' as const,
              paymentMethod: 'CARD' as const,
              date: '2026-05-08',
              isRecurring: false
            }
          ],
          totalElements: 1,
          totalPages: 1,
          size: 50,
          number: 0
        })
      )
    );
    expenseService.getTotalByMonth.and.returnValue(of(createApiResponse(1000)));
    expenseService.deleteExpense.and.returnValue(of(createApiResponse(void 0)));

    await TestBed.configureTestingModule({
      imports: [ExpenseListComponent, RouterTestingModule],
      providers: [
        { provide: ExpenseService, useValue: expenseService },
        {
          provide: CategoryService,
          useValue: {
            getCategories: jasmine.createSpy('getCategories').and.returnValue(
              of(createApiResponse([{ categoryId: 2, name: 'Food', type: 'EXPENSE', icon: 'shopping_cart' }]))
            )
          }
        },
        {
          provide: AuthService,
          useValue: { currentUser: signal(mockUser).asReadonly() }
        },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParams$.asObservable() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads expenses and total spend on init', () => {
    expect(component.expenses().length).toBe(1);
    expect(component.totalSpent()).toBe(1000);
  });

  it('filters expenses based on the query param', () => {
    queryParams$.next({ q: 'groc' });
    expect(component.expenses().length).toBe(1);

    queryParams$.next({ q: 'travel' });
    expect(component.expenses().length).toBe(0);
  });

  it('deletes an expense after confirmation and reloads the list', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteExpense(1);

    expect(expenseService.deleteExpense).toHaveBeenCalledWith(1);
    expect(expenseService.getExpensesByMonth).toHaveBeenCalledTimes(2);
    expect(expenseService.getTotalByMonth).toHaveBeenCalledTimes(2);
  });

  it('checks edit windows and category fallbacks', () => {
    expect(component.canEdit(new Date().toISOString())).toBeTrue();
    expect(component.canEdit(undefined)).toBeFalse();
    expect(component.getCategoryName(999)).toBe('Uncategorized');
    expect(component.getCategoryIcon(2)).toBe('shopping_cart');
  });
});
