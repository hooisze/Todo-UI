import { Component } from '@angular/core';
import { TaskViewModel } from '../../../../models/sideBar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-view',
  imports: [CommonModule],
  templateUrl: './task-view.html',
  styleUrl: './task-view.scss',
})
export class TaskView {
  public taskViewList: TaskViewModel[] = [
    { id: 1, title: 'Today', icon: 'pi pi-list', link: '' },
    { id: 2, title: 'Upcoming', icon: 'pi pi-angle-double-right', link: '' },
    { id: 3, title: 'Calendar', icon: 'pi pi-calendar', link: '' },
  ];
}
