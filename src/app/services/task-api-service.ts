import { Injectable } from '@angular/core';
import { ApiRequestsService } from '../shares/services/api-requests.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private moduleRoute: string = 'tasks';

  constructor(private apiService: ApiRequestsService) {
  }

  public fetchAllTasks(): Observable<any[]> {
    const endpoint = `${this.moduleRoute}`;

    return this.apiService.createRequest<any>(endpoint, 'GET');
  }

  public AddTask(body: any): Observable<any[]> {
    const endpoint = `${this.moduleRoute}`;

    return this.apiService.createRequest<any>(
      endpoint,
      'POST',
      {},
      body,
      true
    );
  }

  public UpdateTask(id: string, body: any): Observable<any[]> {
    const endpoint = `${this.moduleRoute}/${id}`;

    return this.apiService.createRequest<any>(
      endpoint,
      'PUT',
      {},
      body,
      true
    );
  }

   public RemoveAllTasks(): Observable<any[]> {
    const endpoint = `${this.moduleRoute}/remove_all`;

    return this.apiService.createRequest<any>(
      endpoint,
      'DELETE',
      {},

      true
    );
  }
}
