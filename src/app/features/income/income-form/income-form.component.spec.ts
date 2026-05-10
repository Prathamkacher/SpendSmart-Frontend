import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { IncomeFormComponent } from './income-form.component';
import { AuthService } from '../../../core/services/auth.service';
import { IncomeService } from '../../../core/services/income.service';
import { RecurringService } from '../../../core/services/recurring.service';
import { createApiResponse, mockUser } from '../../../../testing/test-helpers';
import { Router } from '@angular/router';

describe('IncomeFormComponent', () => {
  let fixture: ComponentFixture<IncomeFormComponent>;
  let component: IncomeFormComponent;
  let router: Router;
  let incomeService: jasmine.SpyObj<IncomeService>;
  let recurringService: jasmine.SpyObj<RecurringService>;

  beforeEach(async () => {
    incomeService = jasmine.createSpyObj<IncomeService>('IncomeService', ['addIncome']);
    recurringService = jasmine.createSpyObj<RecurringService>('RecurringService', ['addRecurring']);

    incomeService.addIncome.and.returnValue(
      of(
        createApiResponse({
          userId: 7,
          categoryId: 1,
          title: 'Salary',
          amount: 100000,
          currency: 'INR',
          source: 'SALARY' as const,
          date: '2026-05-01',
          isRecurring: true
        })
      )
    );
    recurringService.addRecurring.and.returnValue(of(createApiResponse({} as any)));

    await TestBed.configureTestingModule({
      imports: [IncomeFormComponent, RouterTestingModule],
      providers: [
        { provide: IncomeService, useValue: incomeService },
        { provide: RecurringService, useValue: recurringService },
        {
          provide: AuthService,
          useValue: { currentUser: signal(mockUser).asReadonly() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('prefills the form currency from the current user', () => {
    expect(component.incomeForm.get('currency')?.value).toBe('INR');
  });

  it('does not submit invalid forms', () => {
    component.incomeForm.patchValue({ title: '', amount: null });
    component.onSubmit();
    expect(incomeService.addIncome).not.toHaveBeenCalled();
  });

  it('creates recurring incomes and navigates back to the list', () => {
    component.incomeForm.patchValue({
      title: 'Salary',
      amount: 100000,
      source: 'SALARY',
      date: '2026-05-01',
      isRecurring: true,
      recurrencePeriod: 'MONTHLY'
    });

    component.onSubmit();

    expect(incomeService.addIncome).toHaveBeenCalled();
    expect(recurringService.addRecurring).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/income']);
  });

  it('saves non-recurring income and navigates back', () => {
    component.incomeForm.patchValue({
      title: 'Bonus',
      amount: 5000,
      source: 'OTHER',
      date: '2026-05-01',
      isRecurring: false
    });

    component.onSubmit();

    expect(incomeService.addIncome).toHaveBeenCalled();
    expect(recurringService.addRecurring).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/income']);
  });

  it('handles add income error', () => {
    component.incomeForm.patchValue({
      title: 'Bonus',
      amount: 5000,
      source: 'OTHER',
      date: '2026-05-01',
      isRecurring: false
    });
    
    // @ts-ignore
    incomeService.addIncome.and.returnValue(of({ success: false }));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
