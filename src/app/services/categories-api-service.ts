import { Injectable } from '@angular/core';
import { ApiRequestsService } from '../shares/services/api-requests.service';
import { Observable } from 'rxjs';
import { Categories } from '../models/sideBar';

@Injectable({
  providedIn: 'root',
})
export class CategoriesApiService {
  private moduleRoute: string = 'categories';

  constructor(private apiService: ApiRequestsService) {}

  public fetchAllCategories(): Observable<Categories[]> {
    const endpoint = `${this.moduleRoute}`;

    return this.apiService.createRequest<any>(endpoint, 'GET');
  }

  public getCategoriesSummary(): Observable<Categories[]> {
    const endpoint = `${this.moduleRoute}/total_categories`;

    return this.apiService.createRequest<any>(endpoint, 'GET');
  }
}
