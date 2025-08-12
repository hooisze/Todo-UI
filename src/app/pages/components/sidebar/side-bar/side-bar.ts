import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesList } from '../categories-list/categories-list';
import { TaskView } from '../task-view/task-view';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, CategoriesList, TaskView],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {
  constructor() {}
}
