import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  { path: '', component: ReportsComponent }
];

@NgModule({
  declarations: [
    ReportsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BaseChartDirective
  ]
})
export class AnalyticsModule { }
