import { inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable, catchError, of, retry, switchMap } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiRequestsService {
  private baseApiUrl: string = '';
  private isLocalApi = environment.location === 'local-api';
  private userName: string | null = null;

  constructor(
    private httpService: HttpClient,
  ) {
    this.isLocalApi ? this.setUpLocalEnvironment() : this.setBaseApiUrl();
  }

  private setUpLocalEnvironment(): void {
    this.baseApiUrl = `${environment.apiUrl}`;
  }

  private setBaseApiUrl(): void {
    this.baseApiUrl = `${environment.apiUrl}`;
  }

  public createRequest<T>(
    endPoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    queryParams?: Params,
    body?: any,
    shouldRetry: boolean = true
  ): Observable<T> {
    const url = `${this.baseApiUrl}/${endPoint}`;
    const options: { withCredentials: boolean; params?: Params; body?: any } = {
      withCredentials: true,
    };

    if (queryParams) {
      options.params = queryParams;
    }
    if (body) {
      options.body = body;
    }

    

    return this.httpService.request<T>(method, url, options).pipe(
      retry({
        count: shouldRetry ? 2 : 0,
        resetOnSuccess: true,
        delay: (error) => this.retryStrategy(0, error),
      })
    );
  }

  private retryStrategy(
    delay: number,
    error: HttpErrorResponse
  ): Observable<number> {
    if (error.status !== 404 && error.status !== 403 && error.status !== 401) {
      return of(delay);
    }
    throw error;
  }
}
