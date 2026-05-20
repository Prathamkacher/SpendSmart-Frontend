import { Pipe, PipeTransform, inject } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Pipe({
  name: 'userCurrencySymbol',
  standalone: true
})
export class UserCurrencySymbolPipe implements PipeTransform {
  private authService = inject(AuthService);

  transform(_value?: any): string {
    const code = this.authService.currentUserValue?.currency || 'USD';
    return getCurrencySymbol(code, 'wide');
  }
}
