import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Tasks } from '../../models/taskList';
import { TasksService } from '../services/tasks-service';
import { TaskList } from '../components/task-list/task-list';
import { ShareModule } from '../../share.module';
import { TaskDetails } from '../components/task-details/task-details';
import { map } from 'rxjs';

@Component({
  selector: 'app-main-page',
  imports: [FormsModule, CommonModule, TaskList, TaskDetails, ShareModule],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  public task: string = '';

  constructor(public taskService: TasksService) {
    this.taskService.tasks$.pipe(map((data)=> console.log(data)))
  }

  public onSubmit(): void {
    const currentTasks = this.taskService.taskList$.getValue();
    const newTask: Tasks = {
      id: currentTasks.length + 1,
      title: this.task,
      description: "",
      subTasks: [],
      completed: false
    };

    this.taskService.addTask(newTask)
    
    const updatedTasks = [...currentTasks, newTask];

    this.taskService.taskList$.next(updatedTasks);
    this.task = '';
  }

  public onClear(): void {
    this.taskService.clearTaskList();
    this.taskService.clearTaskList()
  }


}
