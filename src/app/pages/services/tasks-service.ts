import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, tap, Subject, switchMap, startWith, merge, shareReplay, catchError, of, EMPTY, takeUntil } from 'rxjs';
import { Tasks } from '../../models/taskList';
import { TaskApiService } from '../../services/task-api-service';
import { CategoriesApiService } from '../../services/categories-api-service';
import { SelectOptions } from '../../models/selectOptions';
import { Categories } from '../../models/sideBar';
const defaultTask: Tasks = {
  id: '',
  title: '',
  categories: '',
  description: '',
  completed: false,
  subTasks: [],
};

@Injectable({
  providedIn: 'root',
})
export class TasksService implements OnDestroy {
  // Private subjects for internal state management
  private taskListSubject$ = new BehaviorSubject<Tasks[]>([]);
  private currentTaskSubject$ = new BehaviorSubject<Tasks>(defaultTask);
  private taskChangedSubject$ = new Subject<void>();
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>();

  // Public observables - reactive streams
  public taskList$ = this.taskListSubject$.asObservable();
  public currentTask$ = this.currentTaskSubject$.asObservable();
  public taskChanged$ = this.taskChangedSubject$.asObservable();
  public tasks$: Observable<any[]>;
  public categories$: Observable<SelectOptions[]>;

  constructor(
    private apiService: TaskApiService,
    private categoriesService: CategoriesApiService
  ) {
    // Initialize reactive streams
    this.tasks$ = this.createTasksStream();
    this.categories$ = this.createCategoriesStream();
    
    // Start loading tasks
    this.refreshTrigger$.next();
  }

  // Create reactive stream for tasks with category details
  private createTasksStream(): Observable<any[]> {
    const tasksWithRefresh$ = this.refreshTrigger$.pipe(
      switchMap(() => 
        this.apiService.fetchAllTasks().pipe(
          tap(tasks => this.taskListSubject$.next(tasks)),
          catchError(error => {
            console.error('Error fetching tasks:', error);
            return of([]);
          })
        )
      )
    );

    return combineLatest([
      tasksWithRefresh$,
      this.categoriesService.fetchAllCategories(),
      this.currentTaskSubject$,
    ]).pipe(
      map(([tasks, categories, currentTask]: [Tasks[], Categories[], Tasks]) => {
        return tasks.map((task) => {
          const category = categories.find(cat => cat.id === task.categories);
          return {
            ...task,
            categoryDetails: category
              ? { label: category.title, color: category.color }
              : null,
          };
        });
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntil(this.destroy$)
    );
  }

  // Create reactive stream for categories as select options
  private createCategoriesStream(): Observable<SelectOptions[]> {
    return this.categoriesService.fetchAllCategories().pipe(
      map((categories: Categories[]) => this.transformCategoriesToSelectOptions(categories)),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntil(this.destroy$)
    );
  }

  // Trigger refresh of tasks
  private refreshTasks(): void {
    this.refreshTrigger$.next();
  }

  private notifyTaskChange(): void {
    this.taskChangedSubject$.next();
  }

  // Legacy method - now redirects to reactive stream
  public getAllTasks(): Observable<Tasks[]> {
    return this.tasks$;
  }

  public transformCategoriesToSelectOptions(
    categories: Categories[]
  ): SelectOptions[] {
    console.log(categories);
    return categories.map((category) => ({
      label: category.title,
      value: category.id,
      disabled: false,
    }));
  }

  // Reactive task operations
  public addTask(task: Tasks): Observable<any> {
    return this.apiService.AddTask(task).pipe(
      tap((response: any) => {
        if (response['status'] === 'success') {
          this.refreshTasks();
          this.notifyTaskChange();
        }
      }),
      catchError((error) => {
        console.error('Error adding task:', error);
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    );
  }

  public updateTask(task_id: string, task: Tasks): Observable<any> {
    return this.apiService.UpdateTask(task_id, task).pipe(
      tap((response: any) => {
        if (response['status'] === 'success') {
          this.refreshTasks();
          this.notifyTaskChange();
        }
      }),
      catchError((error) => {
        console.error('Error updating task:', error);
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    );
  }

  public clearTaskList(): Observable<any> {
    return this.apiService.RemoveAllTasks().pipe(
      tap((response) => {
        console.log('All tasks removed:', response);
        this.refreshTasks();
        this.notifyTaskChange();
      }),
      catchError((error) => {
        console.error('Error clearing tasks:', error);
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    );
  }

  public removeCurrentTask(id: string): Observable<any> {
    return this.apiService.RemoveCurrentTask(id).pipe(
      tap((response) => {
        this.resetCurrentTask();
        this.refreshTasks();
        this.notifyTaskChange();
      }),
      catchError((error) => {
        console.error('Error removing task:', error);
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    );
  }

  public resetCurrentTask(): void {
    this.currentTaskSubject$.next(defaultTask);
  }

  // Method to update current task
  public setCurrentTask(task: Tasks): void {
    this.currentTaskSubject$.next(task);
  }

  // Improved getCurrentCategoryByID with reactive approach
  public getCurrentCategoryByID(id: string): Observable<string> {
    return this.categoriesService.fetchAllCategories().pipe(
      map(categories => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.title : '';
      }),
      catchError(() => of('')),
      takeUntil(this.destroy$)
    );
  }

  // Manual refresh method
  public refreshAllData(): void {
    this.refreshTasks();
  }

  // OnDestroy implementation
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.taskChangedSubject$.complete();
    this.refreshTrigger$.complete();
    this.taskListSubject$.complete();
    this.currentTaskSubject$.complete();
  }
}
