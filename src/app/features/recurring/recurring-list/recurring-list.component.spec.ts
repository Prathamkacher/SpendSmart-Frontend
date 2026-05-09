import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RecurringListComponent } from './recurring-list.component';
import { CategoryService } from '../../../core/services/category.service';
import { RecurringService } from '../../../core/services/recurring.service';
import { createApiResponse } from '../../../../testing/test-helpers';

describe('RecurringListComponent', () => {
  let component: RecurringListComponent;
  let fixture: ComponentFixture<RecurringListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurringListComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: RecurringService,
          useValue: {
            getUserRecurring: jasmine.createSpy('getUserRecurring').and.returnValue(of(createApiResponse([]))),
            deactivateRecurring: jasmine.createSpy('deactivateRecurring').and.returnValue(of(createApiResponse({} as any))),
            activateRecurring: jasmine.createSpy('activateRecurring').and.returnValue(of(createApiResponse({} as any))),
            deleteRecurring: jasmine.createSpy('deleteRecurring').and.returnValue(of(createApiResponse(void 0)))
          }
        },
        {
          provide: CategoryService,
          useValue: {
            getCategories: jasmine.createSpy('getCategories').and.returnValue(of(createApiResponse([])))
          }
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
});
