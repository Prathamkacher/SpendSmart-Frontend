import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecurringService, RecurringTransaction } from '../../../core/services/recurring.service';
import { UserCurrencyPipe } from '../../../shared/pipes/user-currency.pipe';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  transactions: RecurringTransaction[];
}

@Component({
  selector: 'app-recurring-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, UserCurrencyPipe],
  templateUrl: './recurring-calendar.component.html',
  styleUrls: ['./recurring-calendar.component.css']
})
export class RecurringCalendarComponent implements OnInit {
  private recurringService = inject(RecurringService);

  public currentDate = new Date();
  public today = new Date();
  public calendarDays = signal<CalendarDay[]>([]);
  public weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  recurringTxns = signal<RecurringTransaction[]>([]);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.loadRecurring();
  }

  loadRecurring() {
    this.loading.set(true);
    this.recurringService.getActiveRecurring().subscribe({
      next: (res) => {
        if (res.success) {
          this.recurringTxns.set(res.data);
          this.generateCalendar();
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Go back to Sunday
    
    const endDate = new Date(lastDay);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Go forward to Saturday
    }

    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      // Find transactions due on this day
      // Note: In a real system you'd calculate all projected dates.
      // Here we just check if nextDueDate matches this day, or if frequency math aligns for the current month.
      // For simplicity in this demo, we'll just check if the Day of Month aligns for MONTHLY, 
      // or if nextDueDate is exactly this day.
      const txnsOnDay = this.recurringTxns().filter(t => {
        const nextDue = new Date(t.nextDueDate);
        
        if (t.frequency === 'MONTHLY' && nextDue.getDate() === current.getDate() && current >= new Date(t.startDate)) {
          return true;
        }
        
        if (nextDue.getFullYear() === current.getFullYear() && 
            nextDue.getMonth() === current.getMonth() && 
            nextDue.getDate() === current.getDate()) {
          return true;
        }
        return false;
      });

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        transactions: txnsOnDay
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    this.calendarDays.set(days);
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }
}
