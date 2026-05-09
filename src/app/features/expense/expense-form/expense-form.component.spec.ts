import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ExpenseFormComponent } from './expense-form.component';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { RecurringService } from '../../../core/services/recurring.service';
import { createApiResponse, mockUser } from '../../../../testing/test-helpers';

describe('ExpenseFormComponent', () => {
  let fixture: ComponentFixture<ExpenseFormComponent>;
  let component: ExpenseFormComponent;
  let router: jasmine.SpyObj<Router>;
  let expenseService: jasmine.SpyObj<ExpenseService>;
  let recurringService: jasmine.SpyObj<RecurringService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    expenseService = jasmine.createSpyObj<ExpenseService>('ExpenseService', [
      'getExpenseById',
      'addExpense',
      'updateExpense'
    ]);
    recurringService = jasmine.createSpyObj<RecurringService>('RecurringService', ['addRecurring']);

    expenseService.addExpense.and.returnValue(
      of(
        createApiResponse({
          expenseId: 4,
          userId: 7,
          categoryId: 2,
          title: 'Rent',
          amount: 2000,
          currency: 'INR',
          type: 'EXPENSE' as const,
          paymentMethod: 'UPI' as const,
          date: '2026-05-08',
          isRecurring: true,
          notes: 'Monthly'
        })
      )
    );
    expenseService.updateExpense.and.returnValue(of(createApiResponse({} as any)));
    recurringService.addRecurring.and.returnValue(of(createApiResponse({} as any)));

    await TestBed.configureTestingModule({
      imports: [ExpenseFormComponent, RouterTestingModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: ExpenseService, useValue: expenseService },
        { provide: RecurringService, useValue: recurringService },
        {
          provide: CategoryService,
          useValue: {
            getCategories: jasmine.createSpy('getCategories').and.returnValue(
              of(
                createApiResponse([
                  { categoryId: 2, name: 'Rent', type: 'EXPENSE' },
                  { categoryId: 3, name: 'Salary', type: 'INCOME' }
                ])
              )
            )
          }
        },
        {
          provide: AuthService,
          useValue: { currentUser: signal(mockUser).asReadonly() }
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: {} } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads only expense categories', () => {
    expect(component.categories().length).toBe(1);
    expect(component.categories()[0].type).toBe('EXPENSE');
  });

  it('does not save incomplete expenses', () => {
    component.expense.title = '';
    component.save();
    expect(expenseService.addExpense).not.toHaveBeenCalled();
  });

  it('creates recurring entries and navigates back to expenses', () => {
    component.expense = {
      userId: 7,
      categoryId: 2,
      title: 'Rent',
      amount: 2000,
      currency: 'INR',
      type: 'EXPENSE' as const,
      paymentMethod: 'UPI' as const,
      date: '2026-05-08',
      isRecurring: true,
      recurrencePeriod: 'MONTHLY' as const
    };

    component.save();

    expect(expenseService.addExpense).toHaveBeenCalled();
    expect(recurringService.addRecurring).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/expenses']);
  });

  it('updates existing expenses and navigates back to expenses', () => {
    component.expense = {
      expenseId: 9,
      userId: 7,
      categoryId: 2,
      title: 'Travel',
      amount: 3000,
      currency: 'INR',
      type: 'EXPENSE' as const,
      paymentMethod: 'CARD' as const,
      date: '2026-05-08',
      isRecurring: false
    };

    component.save();

    expect(expenseService.updateExpense).toHaveBeenCalledWith(9, component.expense);
    expect(router.navigate).toHaveBeenCalledWith(['/expenses']);
  });
});
