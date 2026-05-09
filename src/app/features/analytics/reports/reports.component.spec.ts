import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ReportsComponent } from './reports.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { createApiResponse, mockUser } from '../../../../testing/test-helpers';

describe('ReportsComponent', () => {
  let fixture: ComponentFixture<ReportsComponent>;
  let component: ReportsComponent;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {
    analyticsService = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', [
      'getMonthlySummary',
      'getHealthScore',
      'getForecast',
      'getTopCategories',
      'getCategoryBreakdown',
      'getIncomeVsExpenseTrend',
      'getDailyExpenseTrend',
      'downloadMonthlyReport'
    ]);

    analyticsService.getMonthlySummary.and.returnValue(of(createApiResponse({ income: 100, expenses: 50 })));
    analyticsService.getHealthScore.and.returnValue(of(createApiResponse({ score: 90 })));
    analyticsService.getForecast.and.returnValue(of(createApiResponse({ projectedSavings: 1000 })));
    analyticsService.getTopCategories.and.returnValue(of(createApiResponse([{ name: 'Food', total: 500 }])));
    analyticsService.getCategoryBreakdown.and.returnValue(of(createApiResponse({ Food: 500, Travel: 200 })));
    analyticsService.getIncomeVsExpenseTrend.and.returnValue(
      of(createApiResponse({ May: { income: 100, expenses: 50 }, April: { income: 80, expenses: 40 } }))
    );
    analyticsService.getDailyExpenseTrend.and.returnValue(of(createApiResponse({ '2026-05-01': 10, '2026-05-02': 20 })));
    analyticsService.downloadMonthlyReport.and.returnValue(of(new Blob(['csv'])));

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [ReportsComponent],
      providers: [
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: AuthService, useValue: { currentUser: signal(mockUser).asReadonly() } },
        { provide: ThemeService, useValue: { isDark: signal(false).asReadonly() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
  });

  it('loads analytics datasets on init', () => {
    fixture.detectChanges();

    expect(component.summary).toEqual({ income: 100, expenses: 50 });
    expect(component.topCategories.length).toBe(1);
    expect(component.pieChartData.labels).toEqual(['Food', 'Travel']);
    expect(component.barChartData.labels).toEqual(['May']);
  });

  it('downloads reports via the shared blob helper', () => {
    const createObjectUrlSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('blob:csv');
    const revokeObjectUrlSpy = spyOn(window.URL, 'revokeObjectURL');
    const anchor = document.createElement('a');
    const clickSpy = spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.returnValue(anchor);

    component.downloadReport();

    expect(analyticsService.downloadMonthlyReport).toHaveBeenCalled();
    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:csv');
    expect(component.isDownloading).toBeFalse();
  });

  it('resets the export flag if the PDF root element is missing', () => {
    spyOn(document, 'getElementById').and.returnValue(null);
    component.exportToPdf();
    expect(component.isExportingPdf).toBeFalse();
  });

  it('clears the download flag when report downloads fail', () => {
    spyOn(console, 'error');
    analyticsService.downloadMonthlyReport.and.returnValue(
      throwError(() => new Error('Download failed'))
    );

    component.downloadReport();
    expect(component.isDownloading).toBeFalse();
  });
});
