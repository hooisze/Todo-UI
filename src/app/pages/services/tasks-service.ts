import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tasks } from '../../models/taskList';
import { TaskApiService } from '../../services/task-api-service';
const defaultTask: Tasks = {
  id: '',
  title: '',
  categories: "",
  description: '',
  completed: false,
  subTasks: [],
};

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  public taskList$: BehaviorSubject<Tasks[]> = new BehaviorSubject<Tasks[]>([]);
  public tasks$: Observable<any[]>;
  public currentTask$: BehaviorSubject<Tasks> = new BehaviorSubject<Tasks>(
    defaultTask
  );

  constructor(private apiService: TaskApiService) {
    this.tasks$ = this.apiService.fetchAllTasks();
  }

  public addTask(task: Tasks): void {
    const requestObservable = this.apiService.AddTask(task);
    requestObservable.subscribe({
      next: (response: any) => {
        if (response['status'] === 'success') {
          this.tasks$ = this.apiService.fetchAllTasks();
        }
      },
      error: (error) => {
        console.log('Error adding task:', error);
      },
    });
  }

  public updateTask(task_id: string, task: Tasks): void {
    const requestObservable = this.apiService.UpdateTask(task_id, task);
    requestObservable.subscribe({
      next: (response: any) => {
        if (response['status'] === 'success') {
          window.location.reload();
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  public clearTaskList(): void {
    this.apiService.RemoveAllTasks().subscribe({
      next: (response) => {
        console.log('All tasks removed:', response);
        this.tasks$ = this.apiService.fetchAllTasks();
      },
      error: (error) => {
        console.log(error);
      },
    });
    this.resetCurrentTask();
  }

  public removeCurrentTask(id: string): void {
    this.apiService.RemoveCurrentTask(id).subscribe({
      next: (response) => {
        console.log('Removed:', response);
        this.tasks$ = this.apiService.fetchAllTasks();
      },
      error: (error) => {
        console.log(error);
      },
    });
    this.resetCurrentTask();
  }

  public resetCurrentTask(): void {
    this.currentTask$.next(defaultTask);
  }
}
