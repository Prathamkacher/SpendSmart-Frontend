import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserCurrencyPipe } from '../../../shared/pipes/user-currency.pipe';
import { UserCurrencySymbolPipe } from '../../../shared/pipes/user-currency-symbol.pipe';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UserCurrencyPipe, UserCurrencySymbolPipe],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal<boolean>(false);
  loading = signal<boolean>(false);
  showLimitModal = signal<boolean>(false);
  
  category: Category = {
    name: '',
    type: 'EXPENSE',
    icon: '\u{1F4E6}', // 📦
    colorCode: '#6366F1'
  };

  // Safe Unicode Emoji List
  emojiPresets = [
    '\u{1F354}', // 🍔
    '\u{2708}',   // ✈️
    '\u{1F6D2}', // 🛒
    '\u{2615}',   // ☕
    '\u{1F4A1}', // 💡
    '\u{1F3E5}', // 🏥
    '\u{1F3AE}', // 🎮
    '\u{1F457}', // 👗
    '\u{1F3E0}', // 🏠
    '\u{1F697}', // 🚗
    '\u{1F393}', // 🎓
    '\u{1F43E}', // 🐾
    '\u{1F4F1}', // 📱
    '\u{1F381}', // 🎁
    '\u{26BD}'    // ⚽
  ];

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit.set(true);
      this.categoryService.getCategoryById(id).subscribe(res => {
        if (res.success) this.category = res.data;
      });
    }
  }

  save() {
    if (!this.category.name) return;

    if (!this.isEdit() && this.authService.currentUser()?.planType === 'FREE') {
      this.loading.set(true);
      this.categoryService.getCategories().subscribe({
        next: (res) => {
          this.loading.set(false);
          const customCount = res.data ? res.data.filter(c => !c.isDefault).length : 0;
          if (customCount >= 3) {
            this.showLimitModal.set(true);
            this.toastService.show('Limit reached! Buy premium to create unlimited categories.', 'warning');
            return;
          }
          this.proceedSave();
        },
        error: () => {
          this.loading.set(false);
          this.proceedSave();
        }
      });
    } else {
      this.proceedSave();
    }
  }

  private proceedSave() {
    this.loading.set(true);
    const obs = this.isEdit() 
      ? this.categoryService.updateCategory(this.category.categoryId!, this.category)
      : this.categoryService.createCategory(this.category);

    obs.subscribe({
      next: (res) => {
        if (res.success) this.router.navigate(['/categories']);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
