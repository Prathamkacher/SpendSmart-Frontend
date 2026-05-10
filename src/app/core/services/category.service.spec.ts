import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService, Category } from './category.service';
import { environment } from '../../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const mockCategory: Category = {
    categoryId: 1,
    userId: 2,
    name: 'Food',
    type: 'EXPENSE',
    icon: 'restaurant',
    colorCode: '#ff0000',
    budgetLimit: 500,
    isDefault: false
  };

  const mockResponse = {
    success: true,
    message: 'Success',
    data: mockCategory,
    timestamp: '2023-01-01T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all categories', () => {
    const listResponse = { ...mockResponse, data: [mockCategory] };
    service.getCategories().subscribe(res => {
      expect(res.data.length).toBe(1);
      expect(res.data[0].name).toBe('Food');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(listResponse);
  });

  it('should fetch categories by type', () => {
    const listResponse = { ...mockResponse, data: [mockCategory] };
    service.getCategoriesByType('EXPENSE').subscribe(res => {
      expect(res.data.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/type?type=EXPENSE`);
    expect(req.request.method).toBe('GET');
    req.flush(listResponse);
  });

  it('should fetch category by id', () => {
    service.getCategoryById(1).subscribe(res => {
      expect(res.data.categoryId).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a category', () => {
    service.createCategory(mockCategory).subscribe(res => {
      expect(res.data.name).toBe('Food');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCategory);
    req.flush(mockResponse);
  });

  it('should update a category', () => {
    service.updateCategory(1, mockCategory).subscribe(res => {
      expect(res.data.name).toBe('Food');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockCategory);
    req.flush(mockResponse);
  });

  it('should delete a category', () => {
    service.deleteCategory(1).subscribe(res => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ...mockResponse, data: null });
  });

  it('should set budget', () => {
    service.setBudget(1, 1000).subscribe(res => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/1/budget`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ budgetLimit: 1000 });
    req.flush(mockResponse);
  });

  it('should get count', () => {
    service.getCount().subscribe(res => {
      expect(res.data).toBe(5);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/count`);
    expect(req.request.method).toBe('GET');
    req.flush({ ...mockResponse, data: 5 });
  });

  it('should get defaults', () => {
    const listResponse = { ...mockResponse, data: [mockCategory] };
    service.getDefaults().subscribe(res => {
      expect(res.data.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/defaults`);
    expect(req.request.method).toBe('GET');
    req.flush(listResponse);
  });

  it('should init defaults', () => {
    service.initDefaults().subscribe(res => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/init`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockResponse, data: null });
  });
});
