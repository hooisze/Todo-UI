import { Component } from '@angular/core';
import { Categories } from '../../../../models/sideBar';
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
  public categoriesList: Categories[] = [
    { id: 1, title: 'Personal', color: 'red', count: 0 },
    { id: 1, title: 'Work', color: 'yellow', count: 0 },
  ];

  constructor() {}
}
