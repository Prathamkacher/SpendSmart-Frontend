import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { IncomeListComponent } from './income-list.component';
import { AuthService } from '../../../core/services/auth.service';
import { IncomeService } from '../../../core/services/income.service';
import { createApiResponse, mockUser } from '../../../../testing/test-helpers';

describe('IncomeListComponent', () => {
  let fixture: ComponentFixture<IncomeListComponent>;
  let component: IncomeListComponent;
  let incomeService: jasmine.SpyObj<IncomeService>;

  beforeEach(async () => {
    incomeService = jasmine.createSpyObj<IncomeService>('IncomeService', [
      'getIncomesByMonth',
      'getTotalByMonth',
      'deleteIncome'
    ]);
    incomeService.getIncomesByMonth.and.returnValue(
      of(
        createApiResponse({
          content: [
            {
              incomeId: 1,
              title: 'Salary',
              amount: 100000,
              currency: 'INR',
              source: 'SALARY' as const,
              date: '2026-05-01',
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
    incomeService.getTotalByMonth.and.returnValue(of(createApiResponse(100000)));
    incomeService.deleteIncome.and.returnValue(of(createApiResponse(void 0)));

    await TestBed.configureTestingModule({
      imports: [IncomeListComponent, RouterTestingModule],
      providers: [
        { provide: IncomeService, useValue: incomeService },
        {
          provide: AuthService,
          useValue: { currentUser: signal(mockUser).asReadonly() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads incomes and totals on init', () => {
    expect(component.incomes().length).toBe(1);
    expect(component.totalIncome()).toBe(100000);
  });

  it('deletes incomes after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteIncome(1);

    expect(incomeService.deleteIncome).toHaveBeenCalledWith(1);
    expect(incomeService.getIncomesByMonth).toHaveBeenCalledTimes(2);
  });

  it('returns source icons', () => {
    expect(component.getSourceIcon('SALARY')).toBe('work');
    expect(component.getSourceIcon('OTHER')).toBe('payments');
  });
});
