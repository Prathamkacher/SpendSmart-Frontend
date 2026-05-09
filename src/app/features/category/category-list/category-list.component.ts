import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService, Category } from '../../../core/services/category.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  filter = signal<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');

  filteredCategories = () => {
    const currentFilter = this.filter();
    if (currentFilter === 'ALL') return this.categories();
    return this.categories().filter(c => c.type === currentFilter);
  };

  myCategories = () => this.filteredCategories().filter(c => !c.isDefault);
  systemCategories = () => this.filteredCategories().filter(c => c.isDefault);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      if (res.success) this.categories.set(res.data);
    });
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(res => {
        if (res.success) this.loadCategories();
      });
    }
  }

  initDefaults() {
    this.categoryService.initDefaults().subscribe(res => {
      if (res.success) this.loadCategories();
    });
  }
}
