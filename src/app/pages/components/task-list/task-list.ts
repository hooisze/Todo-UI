import { Component } from '@angular/core';
import { TasksService } from '../../services/tasks-service';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../../../share.module';
import { map, Observable, tap } from 'rxjs';
import { Tasks } from '../../../models/taskList';
import { SmallContainer } from '../../../shares/components/small-container/small-container';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, ShareModule, SmallContainer],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {

  constructor(public taskService: TasksService) {

  }


  public viewTask(currTask: Tasks): void{
     this.taskService.currentTask$.next(currTask);
     console.log(currTask)
  }

  public updateTask(updatedTask: Tasks): void {
    const currentTasks =[ this.taskService.currentTask$.getValue()];

    const updatedTasks = currentTasks.map((task) =>
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task
    );

    // this.taskService.taskList$.next(updatedTasks);
  }

  public removeTask(taskId: number): void {
    const currentTasks = this.taskService.currentTask$.getValue();
    this.taskService.removeCurrentTask(currentTasks.id.toString())

  }
}
