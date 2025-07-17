import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tasks } from '../../models/taskList';
import { ApiRequestsService } from '../../shares/services/api-requests.service';
import { TaskApiService } from '../../services/task-api-service';
const defaultTask: Tasks = {
  id: 0,
  title: '',
  description: '',
  completed: false,
  subTasks: []
};

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  public taskList$: BehaviorSubject<Tasks[]> = new BehaviorSubject<Tasks[]>([]);
  public tasks$: Observable<any[]>;
  public currentTask$: BehaviorSubject<Tasks> = new BehaviorSubject<Tasks>(defaultTask);;


  constructor(private apiService: TaskApiService) {
    this.tasks$ = this.apiService.fetchAllTasks()
  }

  public addTask(task: Tasks): void {
    const requestObservable = this.apiService.AddTask(task);
    requestObservable.subscribe({
      next: (response) => {
        console.log(response)
        this.tasks$ = this.apiService.fetchAllTasks()
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  public updateTask(task_id: string, task: Tasks): void {
    console.log(task)
    const requestObservable = this.apiService.UpdateTask(task_id, task);
    requestObservable.subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (error) => {
        console.log(error)
      },
    });
  }

  public clearTaskList(): void {
    this.taskList$.next([]);
    this.apiService.RemoveAllTasks().subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (error) => {
        console.log(error)
      },
    });
    this.resetCurrentTask()
  }

  public resetCurrentTask(): void {
    this.currentTask$.next(defaultTask);
  }
}
