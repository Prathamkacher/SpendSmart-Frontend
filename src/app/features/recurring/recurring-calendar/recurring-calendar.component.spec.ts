import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RecurringCalendarComponent } from './recurring-calendar.component';
import { RecurringService, RecurringTransaction } from '../../../core/services/recurring.service';
import { AuthService } from '../../../core/services/auth.service';
import { createApiResponse } from '../../../../testing/test-helpers';

describe('RecurringCalendarComponent', () => {
  let component: RecurringCalendarComponent;
  let fixture: ComponentFixture<RecurringCalendarComponent>;
  let recurringService: jasmine.SpyObj<RecurringService>;

  const recurringTransactions: RecurringTransaction[] = [
    {
      recurringId: 1,
      userId: 7,
      categoryId: 1,
      title: 'Monthly Rent',
      amount: 1500,
      type: 'EXPENSE',
      frequency: 'MONTHLY',
      startDate: '2026-05-01T00:00:00Z',
      nextDueDate: '2026-05-10T00:00:00Z',
      isActive: true
    },
    {
      recurringId: 2,
      userId: 7,
      categoryId: 2,
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      frequency: 'YEARLY',
      startDate: '2026-01-01T00:00:00Z',
      nextDueDate: '2026-05-15T00:00:00Z',
      isActive: true
    }
  ];

  beforeEach(async () => {
    recurringService = jasmine.createSpyObj<RecurringService>('RecurringService', ['getActiveRecurring']);
    recurringService.getActiveRecurring.and.returnValue(of(createApiResponse(recurringTransactions)));

    await TestBed.configureTestingModule({
      imports: [RecurringCalendarComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: RecurringService,
          useValue: recurringService
        },
        {
          provide: AuthService,
          useValue: { currentUserValue: { currency: 'INR' }, currentUser: () => ({ currency: 'INR', planType: 'FREE' }) }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecurringCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads active recurring transactions and generates the calendar on init', () => {
    expect(recurringService.getActiveRecurring).toHaveBeenCalled();
    expect(component.recurringTxns()).toEqual(recurringTransactions);
    expect(component.calendarDays().length).toBeGreaterThan(30);
    expect(component.loading()).toBeFalse();
  });

  it('maps transactions onto matching calendar days', () => {
    component.currentDate = new Date(2026, 4, 1);
    component.recurringTxns.set(recurringTransactions);

    component.generateCalendar();

    const dueDay = component.calendarDays().find(day => day.date.getDate() === 10 && day.isCurrentMonth);
    const exactDay = component.calendarDays().find(day => day.date.getDate() === 15 && day.isCurrentMonth);

    expect(dueDay?.transactions.map(txn => txn.title)).toContain('Monthly Rent');
    expect(exactDay?.transactions.map(txn => txn.title)).toContain('Salary');
  });

  it('moves backward and forward between months', () => {
    component.currentDate = new Date(2026, 4, 1);
    spyOn(component, 'generateCalendar');

    component.prevMonth();
    expect(component.currentDate.getMonth()).toBe(3);
    expect(component.generateCalendar).toHaveBeenCalledTimes(1);

    component.nextMonth();
    expect(component.currentDate.getMonth()).toBe(4);
    expect(component.generateCalendar).toHaveBeenCalledTimes(2);
  });
});
