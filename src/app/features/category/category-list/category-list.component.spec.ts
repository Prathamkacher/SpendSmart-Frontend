import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListComponent } from './category-list.component';
import { CategoryService, Category } from '../../../core/services/category.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;

  const mockCategories: Category[] = [
    { categoryId: 1, name: 'Food', type: 'EXPENSE', isDefault: false },
    { categoryId: 2, name: 'Salary', type: 'INCOME', isDefault: true },
    { categoryId: 3, name: 'Rent', type: 'EXPENSE', isDefault: true }
  ];

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories', 'deleteCategory', 'initDefaults']);
    
    categoryServiceSpy.getCategories.and.returnValue(of({
      success: true, message: '', timestamp: '', data: mockCategories
    }));

    await TestBed.configureTestingModule({
      imports: [CategoryListComponent, RouterTestingModule],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: {} } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(categoryServiceSpy.getCategories).toHaveBeenCalled();
    expect(component.categories().length).toBe(3);
  });

  it('should filter categories correctly', () => {
    expect(component.filteredCategories().length).toBe(3); // ALL
    
    component.filter.set('EXPENSE');
    expect(component.filteredCategories().length).toBe(2);
    
    component.filter.set('INCOME');
    expect(component.filteredCategories().length).toBe(1);
  });

  it('should separate my categories and system categories', () => {
    expect(component.myCategories().length).toBe(1); // Food
    expect(component.systemCategories().length).toBe(2); // Salary, Rent
  });

  it('should delete category if confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    categoryServiceSpy.deleteCategory.and.returnValue(of({ success: true, message: '', timestamp: '', data: undefined }));
    
    component.deleteCategory(1);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this category?');
    expect(categoryServiceSpy.deleteCategory).toHaveBeenCalledWith(1);
    expect(categoryServiceSpy.getCategories).toHaveBeenCalledTimes(2); // Initial + reload
  });

  it('should not delete category if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteCategory(1);
    
    expect(categoryServiceSpy.deleteCategory).not.toHaveBeenCalled();
  });

  it('should init defaults and reload', () => {
    categoryServiceSpy.initDefaults.and.returnValue(of({ success: true, message: '', timestamp: '', data: undefined }));
    
    component.initDefaults();
    
    expect(categoryServiceSpy.initDefaults).toHaveBeenCalled();
    expect(categoryServiceSpy.getCategories).toHaveBeenCalledTimes(2); // Initial + reload
  });
});
