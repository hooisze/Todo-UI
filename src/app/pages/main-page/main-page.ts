import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Tasks } from '../../models/taskList';
import { TasksService } from '../services/tasks-service';
import { TaskList } from '../components/task-list/task-list';
import { ShareModule } from '../../share.module';
import { TaskDetails } from '../components/task-details/task-details';
import { map } from 'rxjs';
import { SideBar } from '../components/sidebar/side-bar/side-bar';

@Component({
  selector: 'app-main-page',
  imports: [
    FormsModule,
    CommonModule,
    SideBar,
    TaskList,
    TaskDetails,
    ShareModule,
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  public task: string = '';

  constructor(public taskService: TasksService) {
    this.taskService.tasks$.pipe(map((data) => console.log(data)));
  }

  public onSubmit(): void {
    const newTask: Tasks = {
      id: '',
      title: this.task,
      categories: '',
      description: '',
      subTasks: [],
      completed: false,
    };

    this.taskService.addTask(newTask);

    this.task = '';
  }

  public onClear(): void {
    this.taskService.clearTaskList();
    // this.taskService.clearTaskList()
  }
}
