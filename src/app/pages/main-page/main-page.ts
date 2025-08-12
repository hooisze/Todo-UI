import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Tasks } from '../../models/taskList';
import { TasksService } from '../services/tasks-service';
import { TaskList } from '../components/task-list/task-list';
import { ShareModule } from '../../share.module';
import { TaskDetails } from '../components/task-details/task-details';
import { map, takeUntil, Subject } from 'rxjs';
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
export class MainPage implements OnInit, OnDestroy {
  public task: string = '';
  public isSubmitting: boolean = false;
  public isClearing: boolean = false;
  
  // For proper cleanup
  private destroy$ = new Subject<void>();

  constructor(public taskService: TasksService) {}

  ngOnInit(): void {
  }

  public onSubmit(): void {
    if (!this.task.trim()) {
      console.warn('Task title cannot be empty');
      return;
    }

    if (this.isSubmitting) {
      return; // Prevent double submission
    }

    const newTask: Tasks = {
      id: '',
      title: this.task.trim(),
      categories: '',
      description: '',
      subTasks: [],
      completed: false,
    };

    this.isSubmitting = true;

    this.taskService.addTask(newTask)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Task added successfully:', response);
          this.task = ''; // Clear form only on success
          this.isSubmitting = false;
          // You can add success notification here
        },
        error: (error) => {
          console.error('Error adding task:', error);
          this.isSubmitting = false;
          // You can add error notification here
        }
      });
  }

  public onClear(): void {
    if (this.isClearing) {
      return; // Prevent multiple clear operations
    }

    // Optional: Add confirmation dialog
    if (!confirm('Are you sure you want to clear all tasks?')) {
      return;
    }

    this.isClearing = true;

    this.taskService.clearTaskList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('All tasks cleared successfully:', response);
          this.isClearing = false;
          // You can add success notification here
        },
        error: (error) => {
          console.error('Error clearing tasks:', error);
          this.isClearing = false;
          // You can add error notification here
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
