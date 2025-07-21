import { Component } from '@angular/core';
import { Categories } from '../../../models/sideBar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {
  public categoriesList: Categories[] = [
    { id: 1, name: 'Personal', color: 'red', count: 0 },
    { id: 1, name: 'Work', color: 'yellow', count: 0 },
  ];
}
