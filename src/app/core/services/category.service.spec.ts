import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('covers category listing endpoints', () => {
    expect().nothing();

    service.getCategories().subscribe();
    httpMock.expectOne('http://localhost:8080/categories').flush(createApiResponse([]));

    service.getCategoriesByType('EXPENSE').subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/categories/type' &&
          request.params.get('type') === 'EXPENSE'
      )
      .flush(createApiResponse([]));

    service.getCategoryById(5).subscribe();
    httpMock.expectOne('http://localhost:8080/categories/5').flush(createApiResponse({} as any));

    service.getDefaults().subscribe();
    httpMock.expectOne('http://localhost:8080/categories/defaults').flush(createApiResponse([]));

    service.getCount().subscribe();
    httpMock.expectOne('http://localhost:8080/categories/count').flush(createApiResponse(3));
  });

  it('covers category mutation endpoints', () => {
    const payload = {
      name: 'Groceries',
      type: 'EXPENSE' as const,
      colorCode: '#22c55e',
      budgetLimit: 15000
    };

    service.createCategory(payload).subscribe();
    const createReq = httpMock.expectOne('http://localhost:8080/categories');
    expect(createReq.request.method).toBe('POST');
    createReq.flush(createApiResponse(payload));

    service.updateCategory(8, payload).subscribe();
    const updateReq = httpMock.expectOne('http://localhost:8080/categories/8');
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush(createApiResponse(payload));

    service.setBudget(8, 18000).subscribe();
    const budgetReq = httpMock.expectOne('http://localhost:8080/categories/8/budget');
    expect(budgetReq.request.method).toBe('PUT');
    expect(budgetReq.request.body).toEqual({ budgetLimit: 18000 });
    budgetReq.flush(createApiResponse({ ...payload, budgetLimit: 18000 }));

    service.initDefaults().subscribe();
    const initReq = httpMock.expectOne('http://localhost:8080/categories/init');
    expect(initReq.request.method).toBe('POST');
    expect(initReq.request.body).toEqual({});
    initReq.flush(createApiResponse(void 0));

    service.deleteCategory(8).subscribe();
    const deleteReq = httpMock.expectOne('http://localhost:8080/categories/8');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(createApiResponse(void 0));
  });
});
