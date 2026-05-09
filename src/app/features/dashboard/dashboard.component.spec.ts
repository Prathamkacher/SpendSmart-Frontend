import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseService } from '../../core/services/expense.service';
import { IncomeService } from '../../core/services/income.service';
import { RecurringService } from '../../core/services/recurring.service';
import { ThemeService } from '../../core/services/theme.service';
import { createApiResponse, mockUser } from '../../../testing/test-helpers';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let fragment$: Subject<string | null>;
  let themeDark = signal(false);

  beforeEach(async () => {
    fragment$ = new Subject<string | null>();

    TestBed.overrideComponent(DashboardComponent, {
      set: {
        template: '<section>dashboard</section>'
      }
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(mockUser).asReadonly(),
            getProfile: jasmine.createSpy('getProfile').and.returnValue(of(createApiResponse(mockUser)))
          }
        },
        {
          provide: ExpenseService,
          useValue: {
            getExpensesByMonth: jasmine
              .createSpy('getExpensesByMonth')
              .and.returnValue(of(createApiResponse({ content: [], totalElements: 0, totalPages: 0, size: 50, number: 0 }))),
            getTotalByMonth: jasmine.createSpy('getTotalByMonth').and.returnValue(of(createApiResponse(1200)))
          }
        },
        {
          provide: IncomeService,
          useValue: {
            getTotalByMonth: jasmine.createSpy('getTotalByMonth').and.returnValue(of(createApiResponse(2400)))
          }
        },
        {
          provide: AnalyticsService,
          useValue: {
            getHealthScore: jasmine.createSpy('getHealthScore').and.returnValue(of(createApiResponse({ score: 80 }))),
            getIncomeVsExpenseTrend: jasmine.createSpy('getIncomeVsExpenseTrend').and.returnValue(
              of(
                createApiResponse({
                  May: { income: 2400, expenses: 1200 },
                  April: { income: 2000, expenses: 1000 }
                })
              )
            )
          }
        },
        {
          provide: CategoryService,
          useValue: {
            getCategories: jasmine.createSpy('getCategories').and.returnValue(
              of(
                createApiResponse([
                  { categoryId: 2, name: 'Food', type: 'EXPENSE', isDefault: false }
                ])
              )
            )
          }
        },
        {
          provide: BudgetService,
          useValue: {
            getActiveBudgets: jasmine.createSpy('getActiveBudgets').and.returnValue(
              of(createApiResponse([{ budgetId: 1, categoryId: 2, name: 'Food', limitAmount: 5000, currency: 'INR', period: 'MONTHLY', startDate: '2026-05-01', endDate: '2026-05-31' }]))
            )
          }
        },
        { provide: RecurringService, useValue: {} },
        {
          provide: ThemeService,
          useValue: {
            isDark: themeDark.asReadonly()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: fragment$.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('loads summary data on init', () => {
    fixture.detectChanges();

    expect(component.totalSpent()).toBe(1200);
    expect(component.totalIncome()).toBe(2400);
    expect(component.healthScore).toEqual({ score: 80 });
    expect(component.barChartData.labels?.length).toBe(1);
  });

  it('updates chart colors when the theme changes', () => {
    fixture.detectChanges();
    themeDark.set(true);
    fixture.detectChanges();

    const scales = component.barChartOptions?.scales as Record<string, any> | undefined;
    expect(scales?.['y']?.ticks?.color).toBe('#9ca3af');
  });

  it('scrolls to the expense form fragment when requested', fakeAsync(() => {
    fixture.detectChanges();
    const scrollSpy = jasmine.createSpy('scrollIntoView');
    spyOn(document, 'getElementById').and.returnValue({ scrollIntoView: scrollSpy } as any);

    fragment$.next('add-expense-form');
    tick(500);

    expect(document.getElementById).toHaveBeenCalledWith('add-expense-form');
    expect(scrollSpy).toHaveBeenCalled();
  }));
});
