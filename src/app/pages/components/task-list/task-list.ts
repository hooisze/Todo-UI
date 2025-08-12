import { Component, OnInit, OnDestroy } from '@angular/core';
import { TasksService } from '../../services/tasks-service';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../../../share.module';
import { map, Observable, tap, takeUntil, Subject } from 'rxjs';
import { Tasks } from '../../../models/taskList';
import { SmallContainer } from '../../../shares/components/small-container/small-container';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, ShareModule, SmallContainer],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit, OnDestroy {
  // For proper cleanup
  private destroy$ = new Subject<void>();
  
  // Expose tasks stream for template
  public tasks$: Observable<any[]>;

  constructor(public taskService: TasksService) {
    this.tasks$ = this.taskService.tasks$;
  }

  ngOnInit(): void {
    // Any initialization logic can go here
    // The tasks$ observable is already available for the template
  }


  public viewTask(currTask: Tasks): void {
    // Use the service method to set current task
    this.taskService.setCurrentTask(currTask);
    console.log('Selected task:', currTask);
  }

  public updateTask(updatedTask: Tasks): void {
    if (!updatedTask.id) {
      console.error('Cannot update task without ID');
      return;
    }

    // Use the service to update the task
    this.taskService.updateTask(updatedTask.id.toString(), updatedTask)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Task updated successfully');
          // Optionally update current task if it's the same task
          this.taskService.setCurrentTask(updatedTask);
        },
        error: (error) => {
          console.error('Error updating task:', error);
        }
      });
  }

  public removeTask(taskId: number): void {
    this.taskService.removeCurrentTask(taskId.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Task removed successfully');
          // Current task is automatically reset by the service
        },
        error: (error) => {
          console.error('Error removing task:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
