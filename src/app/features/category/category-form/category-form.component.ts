import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal<boolean>(false);
  loading = signal<boolean>(false);
  
  category: Category = {
    name: '',
    type: 'EXPENSE',
    icon: '📦',
    colorCode: '#6366F1'
  };

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
