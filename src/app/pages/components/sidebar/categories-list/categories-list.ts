import { Component } from '@angular/core';
import { CategoriesService } from '../../../services/categories-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-list',
  imports: [CommonModule],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.scss',
})
export class CategoriesList {
  constructor(public categoriesService: CategoriesService) {
  }
}
