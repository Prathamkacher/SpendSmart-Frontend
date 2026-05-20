import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Pipe({
  name: 'userCurrency',
  standalone: true
})
export class UserCurrencyPipe implements PipeTransform {
  private authService = inject(AuthService);
  private currencyPipe = new CurrencyPipe('en-US');

  transform(value: number | string | null | undefined, digitsInfo: string = '1.2-2'): string | null {
    if (value == null || value === '') return null;
    const code = this.authService.currentUserValue?.currency || 'USD';
    return this.currencyPipe.transform(value, code, 'symbol', digitsInfo);
  }
}
