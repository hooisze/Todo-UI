import { Injectable } from '@angular/core';
import { CategoriesApiService } from '../../services/categories-api-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  public categories$: Observable<any[]>;

  constructor(public apiService: CategoriesApiService) {
        this.categories$ = this.apiService.fetchAllCategories();
  }
}
