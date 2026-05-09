import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RecurringFormComponent } from './recurring-form.component';
import { CategoryService } from '../../../core/services/category.service';
import { RecurringService } from '../../../core/services/recurring.service';
import { createApiResponse } from '../../../../testing/test-helpers';

describe('RecurringFormComponent', () => {
  let component: RecurringFormComponent;
  let fixture: ComponentFixture<RecurringFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurringFormComponent, RouterTestingModule],
      providers: [
        {
          provide: RecurringService,
          useValue: {
            addRecurring: jasmine.createSpy('addRecurring').and.returnValue(of(createApiResponse({} as any))),
            getRecurringById: jasmine.createSpy('getRecurringById').and.returnValue(of(createApiResponse({} as any))),
            updateRecurring: jasmine.createSpy('updateRecurring').and.returnValue(of(createApiResponse({} as any)))
          }
        },
        {
          provide: CategoryService,
          useValue: {
            getCategories: jasmine.createSpy('getCategories').and.returnValue(of(createApiResponse([])))
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        }
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
});
