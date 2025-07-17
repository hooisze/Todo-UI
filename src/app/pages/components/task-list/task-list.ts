import { Component } from '@angular/core';
import { TasksService } from '../../services/tasks-service';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../../../share.module';
import { map, Observable } from 'rxjs';
import { Tasks } from '../../../models/taskList';
import { SmallContainer } from '../../../shares/components/small-container/small-container';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, ShareModule, SmallContainer],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  public taskList$: Observable<Tasks[]>;

  constructor(public taskService: TasksService) {
    this.taskList$ = this.getTask();
  }

  private getTask(): Observable<Tasks[]> {
    return this.taskService.tasks$.pipe(
      map((tasks) => this.sortTasks(tasks))
    );
  }

  private sortTasks(tasks: Tasks[]): Tasks[] {
    return tasks.sort((a, b) => b.id - a.id);
  }

  public viewTask(currTask: Tasks): void{
     this.taskService.currentTask$.next(currTask);
     console.log(currTask)
  }

  public updateTask(updatedTask: Tasks): void {
    const currentTasks = this.taskService.taskList$.getValue();

    const updatedTasks = currentTasks.map((task) =>
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task
    );

    this.taskService.taskList$.next(updatedTasks);
  }

  public removeTask(taskId: number): void {
    const currentTasks = this.taskService.taskList$.getValue();

    const updatedTasks = currentTasks.filter((task) => task.id !== taskId);

    this.taskService.taskList$.next(updatedTasks);
  }
}
