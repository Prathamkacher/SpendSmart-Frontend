import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryFormComponent } from './category-form.component';
import { CategoryService } from '../../../core/services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategoryById', 'createCategory', 'updateCategory']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CategoryFormComponent, FormsModule, RouterTestingModule],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: Router, useValue: routerSpy },
        { 
          provide: ActivatedRoute, 
          useValue: { snapshot: { params: { id: 1 } } } 
        }
      ]
    }).compileComponents();

    categoryServiceSpy.getCategoryById.and.returnValue(of({
      success: true,
      message: 'Found',
      timestamp: '2023-01-01',
      data: { categoryId: 1, name: 'Food', type: 'EXPENSE' }
    }));

    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load category on init if id is present', () => {
    expect(component.isEdit()).toBeTrue();
    expect(categoryServiceSpy.getCategoryById).toHaveBeenCalledWith(1);
    expect(component.category.name).toBe('Food');
  });

  it('should not save if name is empty', () => {
    component.category.name = '';
    component.save();
    expect(categoryServiceSpy.updateCategory).not.toHaveBeenCalled();
    expect(categoryServiceSpy.createCategory).not.toHaveBeenCalled();
  });

  it('should update category when isEdit is true', () => {
    component.category.name = 'Updated Food';
    categoryServiceSpy.updateCategory.and.returnValue(of({ success: true, message: '', timestamp: '', data: component.category }));
    
    component.save();
    
    expect(categoryServiceSpy.updateCategory).toHaveBeenCalledWith(1, component.category);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/categories']);
    expect(component.loading()).toBeFalse();
  });

  it('should handle error when updating category', () => {
    categoryServiceSpy.updateCategory.and.returnValue(throwError(() => new Error('Error')));
    
    component.save();
    
    expect(component.loading()).toBeFalse();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should create category when isEdit is false', () => {
    component.isEdit.set(false);
    component.category.name = 'New Category';
    categoryServiceSpy.createCategory.and.returnValue(of({ success: true, message: '', timestamp: '', data: component.category }));
    
    component.save();
    
    expect(categoryServiceSpy.createCategory).toHaveBeenCalledWith(component.category);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/categories']);
    expect(component.loading()).toBeFalse();
  });
});
