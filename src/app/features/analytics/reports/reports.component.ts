import { Component, OnInit, inject, effect } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MONTH_OPTIONS, buildYearRange } from '../../../shared/utils/date.utils';
import { downloadBlob } from '../../../shared/utils/file-download.utils';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  summary: any;
  healthScore: any;
  forecast: any;
  topCategories: any[] = [];
  incomeChange = 0;
  expenseChange = 0;
  
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  years = buildYearRange(this.currentYear, 2, 2);
  months = MONTH_OPTIONS;

  // Chart Data
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Income', backgroundColor: '#10b981' },
      { data: [], label: 'Expenses', backgroundColor: '#f43f5e' }
    ]
  };

  public pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ 
      data: [], 
      backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{ data: [], label: 'Savings Rate (%)', borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)' }]
  };

  // Chart Options
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };

  public pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: "system-ui, sans-serif",
            size: 11,
            weight: 'bold'
          }
        }
      } 
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10
      }
    }
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } }
  };

  private themeService = inject(ThemeService);

  constructor(private analyticsService: AnalyticsService) {
    effect(() => {
      const isDark = this.themeService.isDark();
      this.updateChartOptions(isDark);
    });
  }

  updateChartOptions(isDark: boolean) {
    const textColor = isDark ? '#9ca3af' : '#64748b';
    const gridColor = isDark ? '#374151' : '#f1f5f9';

    // Bar Chart
    this.barChartOptions = {
      ...this.barChartOptions,
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      },
      plugins: {
        ...this.barChartOptions?.plugins,
        legend: { ...this.barChartOptions?.plugins?.legend, labels: { color: textColor } }
      }
    };

    // Pie Chart
    this.pieChartOptions = {
      ...this.pieChartOptions,
      plugins: {
        ...this.pieChartOptions?.plugins,
        legend: {
          ...this.pieChartOptions?.plugins?.legend,
          labels: { ...this.pieChartOptions?.plugins?.legend?.labels, color: textColor }
        }
      }
    };

    // Line Chart
    this.lineChartOptions = {
      ...this.lineChartOptions,
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      },
      plugins: {
        ...this.lineChartOptions?.plugins,
        legend: { ...this.lineChartOptions?.plugins?.legend, labels: { color: textColor } }
      }
    };
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.analyticsService.getMonthlySummary(this.currentYear, this.currentMonth).subscribe((res: any) => {
      this.summary = res.data;
    });

    this.analyticsService.getHealthScore(this.currentYear, this.currentMonth).subscribe((res: any) => {
      this.healthScore = res.data;
    });

    this.analyticsService.getForecast().subscribe((res: any) => {
      this.forecast = res.data;
    });

    this.analyticsService.getTopCategories(2, this.currentYear, this.currentMonth).subscribe((res: any) => {
      this.topCategories = res.data || [];
    });

    this.analyticsService.getCategoryBreakdown(this.currentYear, this.currentMonth).subscribe((res: any) => {
      if (res.data) {
        this.pieChartData = {
          labels: Object.keys(res.data),
          datasets: [{ 
            data: Object.values(res.data),
            backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        };
      }
    });

    this.analyticsService.getIncomeVsExpenseTrend(this.currentYear).subscribe((res: any) => {
      if (res.data) {
        const trendData = res.data;
        const currentMonthName = this.months.find(m => m.value === this.currentMonth)?.name || '';
        const prevMonthName = this.months.find(m => m.value === (this.currentMonth - 1))?.name || '';

        const currData = trendData[currentMonthName] || { income: 0, expenses: 0 };
        const prevData = trendData[prevMonthName] || { income: 0, expenses: 0 };

        // Calculate changes
        const currInc = currData.income || 0;
        const prevInc = prevData.income || 0;
        this.incomeChange = prevInc > 0 ? Number.parseFloat(((currInc - prevInc) / prevInc * 100).toFixed(1)) : 0;

        const currExp = currData.expenses || 0;
        const prevExp = prevData.expenses || 0;
        this.expenseChange = prevExp > 0 ? Number.parseFloat(((currExp - prevExp) / prevExp * 100).toFixed(1)) : 0;

        // Only show the selected month in the graph
        const labels = [currentMonthName];
        const income = [currData.income || 0];
        const expenses = [currData.expenses || 0];

        this.barChartData = {
          labels: labels,
          datasets: [
            { data: income, label: 'Income', backgroundColor: '#10b981', borderRadius: 8 },
            { data: expenses, label: 'Expenses', backgroundColor: '#f43f5e', borderRadius: 8 }
          ]
        };
      }
    });

    this.analyticsService.getDailyExpenseTrend(this.currentYear, this.currentMonth).subscribe((res: any) => {
      if (res.data) {
        this.lineChartData = {
          labels: Object.keys(res.data),
          datasets: [{ 
            data: Object.values(res.data), 
            label: 'Daily Spending', 
            borderColor: '#6366f1', 
            tension: 0.4, 
            fill: true, 
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            pointBackgroundColor: '#6366f1'
          }]
        };
      }
    });
  }

  onYearChange(event: any): void {
    this.currentYear = +event.target.value;
    this.loadData();
  }

  onMonthChange(event: any): void {
    this.currentMonth = +event.target.value;
    this.loadData();
  }

  getConfidenceClass(confidence: string): string {
    switch (confidence) {
      case 'HIGH': return 'px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs';
      case 'MEDIUM': return 'px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs';
      default: return 'px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-xs';
    }
  }

  isDownloading = false;

  downloadReport(): void {
    if (this.isDownloading) return;
    this.isDownloading = true;

    this.analyticsService.downloadMonthlyReport(this.currentYear, this.currentMonth).subscribe({
      next: (blob: Blob) => {
        const monthStr = this.currentMonth.toString().padStart(2, '0');
        downloadBlob(blob, `spendsmart-report-${this.currentYear}-${monthStr}.csv`);
        this.isDownloading = false;
      },
      error: (err) => {
        console.error('Download failed', err);
        this.isDownloading = false;
      }
    });
  }

  isExportingPdf = false;

  exportToPdf(): void {
    if (this.isExportingPdf) return;
    this.isExportingPdf = true;

    const data = document.getElementById('analytics-report-content');
    if (!data) {
      this.isExportingPdf = false;
      return;
    }

    // Temporarily disable some UI elements for clean export if needed
    html2canvas(data, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: this.themeService.isDark() ? '#111827' : '#ffffff'
    }).then(canvas => {
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
      const monthStr = this.currentMonth.toString().padStart(2, '0');
      pdf.save(`spendsmart-analytics-${this.currentYear}-${monthStr}.pdf`);
      
      this.isExportingPdf = false;
    }).catch(err => {
      console.error('PDF Export failed', err);
      this.isExportingPdf = false;
    });
  }
}
