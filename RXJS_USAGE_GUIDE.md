# Enhanced TasksService - RxJS Usage Guide

## Overview
The TasksService has been refactored to follow proper RxJS reactive patterns. Here's how to use it effectively in your components.

## Key Changes Made

### 1. **Reactive Streams**
- All operations now return observables
- No more manual subscriptions in the service
- Proper memory management with `takeUntil()`

### 2. **Enhanced Error Handling**
- All API calls have proper error handling
- Graceful fallbacks when operations fail

### 3. **Better Performance**
- Stream caching with `shareReplay()`
- Request cancellation with `switchMap()`
- Automatic cleanup on destroy

## How to Use in Components

### Basic Task List Display
```typescript
export class TaskListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  constructor(private tasksService: TasksService) {}
  
  ngOnInit() {
    // Subscribe to tasks with automatic updates
    this.tasksService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        console.log('Tasks updated:', tasks);
        // Update your component state
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Task Operations (Add/Update/Delete)
```typescript
export class TaskFormComponent {
  private destroy$ = new Subject<void>();
  
  constructor(private tasksService: TasksService) {}
  
  addTask(task: Tasks) {
    // The service now returns observables - you MUST subscribe
    this.tasksService.addTask(task)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Task added successfully');
          // Handle success (e.g., show notification, reset form)
        },
        error: (error) => {
          console.error('Failed to add task:', error);
          // Handle error (e.g., show error message)
        }
      });
  }
  
  updateTask(taskId: string, task: Tasks) {
    this.tasksService.updateTask(taskId, task)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Task updated'),
        error: (error) => console.error('Update failed:', error)
      });
  }
  
  deleteTask(taskId: string) {
    this.tasksService.removeCurrentTask(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Task deleted'),
        error: (error) => console.error('Delete failed:', error)
      });
  }
}
```

### Using with Async Pipe (Recommended)
```typescript
export class TaskDisplayComponent {
  // No need for manual subscriptions!
  tasks$ = this.tasksService.tasks$;
  currentTask$ = this.tasksService.currentTask$;
  categories$ = this.tasksService.categories$;
  
  constructor(private tasksService: TasksService) {}
}
```

```html
<!-- In template -->
<div *ngIf="tasks$ | async as tasks">
  <div *ngFor="let task of tasks">
    {{ task.title }}
  </div>
</div>

<div *ngIf="currentTask$ | async as currentTask">
  Current: {{ currentTask.title }}
</div>
```

### Advanced Usage - Combining Streams
```typescript
export class DashboardComponent implements OnInit {
  // Combine multiple streams
  dashboardData$ = combineLatest([
    this.tasksService.tasks$,
    this.tasksService.categories$
  ]).pipe(
    map(([tasks, categories]) => ({
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      categories: categories.length
    }))
  );
  
  constructor(private tasksService: TasksService) {}
}
```

## Important Notes

### 1. **Subscribe to Task Operations**
The task operations (add, update, delete) now return observables. You MUST subscribe to them:
```typescript
// ❌ Wrong - won't work
this.tasksService.addTask(task);

// ✅ Correct
this.tasksService.addTask(task).subscribe();
```

### 2. **Memory Management**
Always use `takeUntil()` or async pipe to prevent memory leaks:
```typescript
// ✅ Good - with takeUntil
this.tasksService.tasks$
  .pipe(takeUntil(this.destroy$))
  .subscribe();

// ✅ Better - with async pipe (no manual cleanup needed)
tasks$ = this.tasksService.tasks$;
```

### 3. **Error Handling**
The service now has built-in error handling, but you can still handle errors in components:
```typescript
this.tasksService.addTask(task)
  .pipe(
    catchError(error => {
      // Custom error handling
      this.showErrorMessage('Failed to add task');
      return EMPTY; // or return a default value
    })
  )
  .subscribe();
```

## Benefits of the New Implementation

1. **Automatic Updates**: Sidebar and other components automatically update when tasks change
2. **Better Performance**: Caching and request cancellation
3. **Memory Safe**: Proper cleanup prevents memory leaks
4. **Error Resilient**: Graceful error handling
5. **Reactive**: True reactive programming patterns
6. **Testable**: Easier to unit test reactive code

## Migration Checklist

- [ ] Update components to subscribe to task operation observables
- [ ] Use async pipe where possible
- [ ] Add proper cleanup with `takeUntil()` where manual subscriptions are needed
- [ ] Test that sidebar updates automatically after task operations
- [ ] Remove any manual refresh calls (they're now automatic)
