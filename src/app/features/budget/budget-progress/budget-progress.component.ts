import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div class="flex justify-between items-end mb-2">
        <span class="text-xs font-bold text-gray-400 uppercase">{{ label }}</span>
        <span class="text-sm font-bold" [class.text-red-600]="percentage >= 100" [class.text-amber-500]="percentage >= 80 && percentage < 100" [class.text-green-600]="percentage < 80">
          {{ percentage | number:'1.0-1' }}%
        </span>
      </div>
      <div class="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        <div [style.width.%]="percentage > 100 ? 100 : percentage" 
             [class.bg-red-500]="percentage >= 100" 
             [class.bg-amber-400]="percentage >= 80 && percentage < 100" 
             [class.bg-green-500]="percentage < 80" 
             class="h-full transition-all duration-500 ease-out shadow-sm">
        </div>
      </div>
    </div>
  `
})
export class BudgetProgressComponent {
  @Input() percentage: number = 0;
  @Input() label: string = 'Budget Used';
}
