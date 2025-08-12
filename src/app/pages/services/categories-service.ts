import { Injectable, OnDestroy } from '@angular/core';
import { CategoriesApiService } from '../../services/categories-api-service';
import { BehaviorSubject, Observable, switchMap, tap, startWith, Subject, takeUntil, merge, shareReplay, catchError, of } from 'rxjs';
import { TasksService } from './tasks-service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService implements OnDestroy {
  public categories$: Observable<any[]>;
  private destroy$ = new Subject<void>();
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    public apiService: CategoriesApiService,
    private tasksService: TasksService
  ) {
    this.categories$ = this.createCategoriesStream();
  }

  private createCategoriesStream(): Observable<any[]> {
    // Combine initial load trigger with task change notifications
    const triggers$ = merge(
      this.refreshTrigger$,
      this.tasksService.taskChanged$.pipe(startWith(null))
    );

    return triggers$.pipe(
      switchMap(() => 
        this.apiService.getCategoriesSummary().pipe(
          catchError((error) => {
            console.error('Error fetching categories:', error);
            return of([]); // Return empty array on error
          })
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true }), // Cache the latest result
      takeUntil(this.destroy$)
    );
  }

  // Method to manually trigger a refresh if needed
  public refreshCategories(): void {
    this.refreshTrigger$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
