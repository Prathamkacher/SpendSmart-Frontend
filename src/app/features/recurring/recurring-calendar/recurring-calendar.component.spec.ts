import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RecurringCalendarComponent } from './recurring-calendar.component';
import { RecurringService } from '../../../core/services/recurring.service';
import { createApiResponse } from '../../../../testing/test-helpers';

describe('RecurringCalendarComponent', () => {
  let component: RecurringCalendarComponent;
  let fixture: ComponentFixture<RecurringCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurringCalendarComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: RecurringService,
          useValue: {
            getActiveRecurring: jasmine.createSpy('getActiveRecurring').and.returnValue(
              of(createApiResponse([]))
            )
          }
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
});
