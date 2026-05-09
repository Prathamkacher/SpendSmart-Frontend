import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { createApiResponse } from '../../../testing/test-helpers';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('passes optional month and year params for monthly summary', () => {
    service.getMonthlySummary(2026, 5).subscribe();

    const req = httpMock.expectOne(
      request =>
        request.url === 'http://localhost:8080/analytics/monthlySummary' &&
        request.params.get('year') === '2026' &&
        request.params.get('month') === '5'
    );

    expect(req.request.method).toBe('GET');
    req.flush(createApiResponse({ income: 1, expenses: 2 }));
  });

  it('covers the remaining analytics endpoints and query params', () => {
    expect().nothing();
    service.getYearlySummary(2026).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/analytics/yearlySummary' &&
          request.params.get('year') === '2026'
      )
      .flush(createApiResponse([]));

    service.getCategoryBreakdown(2026, 5).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/analytics/categoryBreakdown' &&
          request.params.get('year') === '2026' &&
          request.params.get('month') === '5'
      )
      .flush(createApiResponse({ Food: 500 }));

    service.getIncomeVsExpenseTrend(2026).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/analytics/incomeVsExpense' &&
          request.params.get('year') === '2026'
      )
      .flush(createApiResponse({ May: { income: 10, expenses: 5 } }));

    service.getSavingsRateTrend(2026).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/analytics/savingsRate' &&
          request.params.get('year') === '2026'
      )
      .flush(createApiResponse({ May: 50 }));

    service.getTopCategories(3, 2026, 5).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/analytics/topCategories' &&
          request.params.get('limit') === '3' &&
          request.params.get('year') === '2026' &&
          request.params.get('month') === '5'
      )
      .flush(createApiResponse([]));

    service.getForecast().subscribe();
    httpMock.expectOne('http://localhost:8080/analytics/forecast').flush(createApiResponse({}));

    service.getHealthScore(2026, 5).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/analytics/healthScore' &&
          request.params.get('year') === '2026' &&
          request.params.get('month') === '5'
      )
      .flush(createApiResponse({ score: 90 }));

    service.getDailyExpenseTrend(2026, 5).subscribe();
    httpMock
      .expectOne(
        request =>
          request.url === 'http://localhost:8080/analytics/dailyTrend' &&
          request.params.get('year') === '2026' &&
          request.params.get('month') === '5'
      )
      .flush(createApiResponse({ '2026-05-01': 10 }));
  });

  it('downloads the monthly report as a blob', () => {
    const blob = new Blob(['report'], { type: 'text/csv' });

    service.downloadMonthlyReport(2026, 5).subscribe(response => {
      expect(response).toEqual(blob);
    });

    const req = httpMock.expectOne(
      request =>
        request.url === 'http://localhost:8080/analytics/reports/download' &&
        request.params.get('year') === '2026' &&
        request.params.get('month') === '5'
    );

    expect(req.request.responseType).toBe('blob');
    req.flush(blob);
  });
});
