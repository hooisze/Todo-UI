import { Component, Input } from '@angular/core';
import { Tag } from '../../../models/tag';

@Component({
  selector: 'app-small-container',
  imports: [],
  templateUrl: './small-container.html',
  styleUrl: './small-container.scss'
})
export class SmallContainer {
  @Input() tag?: string;
  @Input() color?: string;
}
