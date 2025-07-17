import { Component } from '@angular/core';
import { TasksService } from '../../services/tasks-service';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../../../share.module';
import { map } from 'rxjs';
import { SubTasks, Tasks } from '../../../models/taskList';

@Component({
  selector: 'app-task-details',
  imports: [CommonModule, ShareModule],
  templateUrl: './task-details.html',
  styleUrl: './task-details.scss',
})
export class TaskDetails {
  public newSubTask: string = '';
  public currentTask: Tasks[]

  constructor(public taskService: TasksService) {
    this.taskService.currentTask$?.pipe(map((tasks) => console.log(tasks)));
    this.currentTask = [this.taskService.currentTask$.getValue()];
  }

  public addSubTask(subTask: string): void {
    console.log(subTask)
    const currentTask = this.taskService.currentTask$.getValue()
    
    const newSubTask: SubTasks = {
      id:currentTask.subTasks.length + 1,
      name: subTask,
      completed: false
    };

    currentTask.subTasks.push(newSubTask);
    this.currentTask = [currentTask]
    this.newSubTask = ""
  }

  public updateTask(updatedTask: Tasks): void {

    console.log(this.currentTask)
    if(this.currentTask.length === 0)
      this.currentTask = [this.taskService.currentTask$.getValue()]

    const updatedTasks = this.currentTask.map((task) =>
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task
    );
    this.taskService.updateTask((updatedTask.id.toString()), updatedTask)

    this.taskService.taskList$.next(updatedTasks);
  }

  public removeTask(taskId: number): void {

    const updatedTasks = this.currentTask.filter((task) => task.id !== taskId);

    this.taskService.taskList$.next(updatedTasks);
    this.taskService.resetCurrentTask()
  }
}
