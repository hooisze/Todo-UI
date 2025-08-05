import { Injectable } from '@angular/core';
import { ApiRequestsService } from '../shares/services/api-requests.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesApiService {
    private moduleRoute: string = 'categories';

    constructor(private apiService: ApiRequestsService) {}

    public fetchAllCategories(): Observable<any[]> {
    const endpoint = `${this.moduleRoute}`;

    return this.apiService.createRequest<any>(endpoint, 'GET');
  }
}