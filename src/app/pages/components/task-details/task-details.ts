import { Component, OnDestroy, OnInit } from '@angular/core';
import { TasksService } from '../../services/tasks-service';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../../../share.module';
import { map, Subscription, tap, takeUntil, Subject } from 'rxjs';
import { SubTasks, Tasks } from '../../../models/taskList';
import { SelectOptions } from '../../../models/selectOptions';

@Component({
  selector: 'app-task-details',
  imports: [CommonModule, ShareModule],
  templateUrl: './task-details.html',
  styleUrl: './task-details.scss',
})
export class TaskDetails implements OnInit, OnDestroy {
  public newSubTask: string = '';
  public currentTask: Tasks[] = [];
  public defaultCategories: SelectOptions[] = [{label: "", value: "0", disabled: false}];
  public isCreatedTask: boolean = false;
  public isNewTaskMode: boolean = false; // Track if we're creating a new task
  public isSubmitting: boolean = false; // Track submission state
  public statusOptions: any[] = [{ label: 'Open', value: false }, { label: 'Closed', value: true }];
  
  // For proper cleanup
  private destroy$ = new Subject<void>();


  constructor(public taskService: TasksService) {}

  ngOnInit(): void {
    // Subscribe to current task changes using proper reactive patterns
    this.taskService.currentTask$
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        this.currentTask = [task];
        this.isCreatedTask = !!task && task.id !== '';
        this.isNewTaskMode = !task || !task.id; // Enable new task mode when no task is selected
      });
  }

  public createTask(createTask: Tasks): void {
    console.log('Creating new task:', createTask);
    
    // Validate required fields
    if (!createTask.title?.trim()) {
      console.error('Task title is required');
      return;
    }

    if (this.isSubmitting) {
      return; // Prevent double submission
    }

    this.isSubmitting = true;

    // Get the current task state which might include subtasks and category added during creation
    const currentTaskWithUpdates = this.getCurrentTask();
    const taskToCreate = {
      ...createTask,
      // Ensure we use the latest state for categories and subtasks
      categories: currentTaskWithUpdates?.categories || createTask.categories || '',
      subTasks: currentTaskWithUpdates?.subTasks || createTask.subTasks || [],
      description: currentTaskWithUpdates?.description || createTask.description || '',
      completed: currentTaskWithUpdates?.completed || createTask.completed || false
    };

    console.log('Task to create with all updates:', taskToCreate);

    // Subscribe to the observable returned by addTask
    this.taskService.addTask(taskToCreate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Task created successfully:', response);
          this.isSubmitting = false;
          
          // Set the newly created task as current task for editing
          // Note: You might want to get the actual created task with ID from the response
          const createdTask = { 
            ...taskToCreate, 
            id: response.id || Date.now().toString() 
          };
          this.taskService.setCurrentTask(createdTask);
          
          // Show success message
          console.log(`Task created successfully with ${createdTask.subTasks.length} subtasks and category: ${createdTask.categories}!`);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.isSubmitting = false;
          console.error('Failed to create task. Please try again.');
        }
      });
  }

  // New method to handle form submission for both create and update
  public onSubmitTask(taskData: Tasks): void {
    if (this.isNewTaskMode) {
      this.createTask(taskData);
    } else {
      this.updateTask(taskData);
    }
  }

  // Method to start creating a new task
  public startNewTask(): void {
    const emptyTask: Tasks = {
      id: '',
      title: '',
      categories: '',
      description: '',
      completed: false,
      subTasks: [],
    };
    
    this.taskService.setCurrentTask(emptyTask);
    this.isNewTaskMode = true;
  }

  // Method to cancel new task creation
  public cancelNewTask(): void {
    this.taskService.resetCurrentTask();
    this.isNewTaskMode = false;
  }

  public addSubTask(subTask: string): void {
    if (!subTask.trim()) return;
    
    // Get current task from the component state (already subscribed)
    const currentTask = this.currentTask[0];
    if (!currentTask) {
      console.error('No current task available');
      return;
    }

    const newSubTask: SubTasks = {
      id: currentTask.subTasks.length + 1,
      name: subTask.trim(),
      completed: false,
    };

    // Create updated task with new subtask
    const updatedTask: Tasks = {
      ...currentTask,
      subTasks: [...currentTask.subTasks, newSubTask]
    };

    // If task has an ID (is saved), update it via API
    if (currentTask.id && !this.isNewTaskMode) {
      this.taskService.updateTask(currentTask.id.toString(), updatedTask)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Subtask added successfully to existing task');
            this.newSubTask = '';
            // Update current task to reflect the change
            this.taskService.setCurrentTask(updatedTask);
          },
          error: (error) => {
            console.error('Error adding subtask to existing task:', error);
          }
        });
    } else {
      // For new tasks (not yet saved), just update the local state
      console.log('Subtask added to new task (will be saved when task is created)');
      this.newSubTask = '';
      // Update current task state locally
      this.taskService.setCurrentTask(updatedTask);
    }
  }

  public updateTask(updatedTask: Tasks): void {
    if (!updatedTask.id) {
      console.error('Cannot update task without ID');
      return;
    }

    if (this.isSubmitting) {
      return; // Prevent double submission
    }

    this.isSubmitting = true;

    // Use the service to update the task
    this.taskService.updateTask(updatedTask.id.toString(), updatedTask)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Task updated successfully');
          this.isSubmitting = false;
          // Update current task to reflect the change
          this.taskService.setCurrentTask(updatedTask);
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.isSubmitting = false;
        }
      });
  }

  public removeTask(taskId: string): void {
    this.taskService.removeCurrentTask(taskId)
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

  public onChangeCategory(selected: any): void {
    console.log('Selected category:', selected.value);
    if (this.currentTask[0]) {
      const updatedTask = {
        ...this.currentTask[0],
        categories: selected.value
      };
      
      // Always update the current task state (for both new and existing tasks)
      this.taskService.setCurrentTask(updatedTask);
      
      // If it's an existing task (has ID), also update via API
      if (updatedTask.id && !this.isNewTaskMode) {
        this.updateTask(updatedTask);
      } else {
        // For new tasks, just log that category will be saved with the task
        console.log('Category selected for new task (will be saved when task is created)');
      }
    }
  }

  // Utility method to check if current task exists and has content
  public hasCurrentTask(): boolean {
    return this.currentTask.length > 0 && !!this.currentTask[0].title;
  }

  // Utility method to check if we can add subtasks (now allows for both new and existing tasks)
  public canAddSubTasks(): boolean {
    const currentTask = this.getCurrentTask();
    return !!currentTask && (!!currentTask.title || this.isNewTaskMode);
  }

  // Utility method to get the current task
  public getCurrentTask(): Tasks | null {
    return this.currentTask.length > 0 ? this.currentTask[0] : null;
  }

  // Method to toggle task completion status
  public toggleTaskCompletion(): void {
    const currentTask = this.getCurrentTask();
    if (currentTask && currentTask.id) {
      const updatedTask = {
        ...currentTask,
        completed: !currentTask.completed
      };
      this.updateTask(updatedTask);
    }
  }

  // Method to remove a subtask (works for both new and existing tasks)
  public removeSubTask(subtaskId: number): void {
    const currentTask = this.getCurrentTask();
    if (!currentTask) return;

    const updatedSubTasks = currentTask.subTasks.filter(subtask => subtask.id !== subtaskId);
    const updatedTask = {
      ...currentTask,
      subTasks: updatedSubTasks
    };

    if (currentTask.id && !this.isNewTaskMode) {
      // Update existing task via API
      this.taskService.updateTask(currentTask.id.toString(), updatedTask)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Subtask removed successfully');
            this.taskService.setCurrentTask(updatedTask);
          },
          error: (error) => {
            console.error('Error removing subtask:', error);
          }
        });
    } else {
      // Update new task locally
      console.log('Subtask removed from new task');
      this.taskService.setCurrentTask(updatedTask);
    }
  }

  // Method to toggle subtask completion
  public toggleSubTaskCompletion(subtaskId: number): void {
    const currentTask = this.getCurrentTask();
    if (!currentTask) return;

    const updatedSubTasks = currentTask.subTasks.map(subtask =>
      subtask.id === subtaskId 
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    const updatedTask = {
      ...currentTask,
      subTasks: updatedSubTasks
    };

    if (currentTask.id && !this.isNewTaskMode) {
      // Update existing task via API
      this.taskService.updateTask(currentTask.id.toString(), updatedTask)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Subtask completion toggled successfully');
            this.taskService.setCurrentTask(updatedTask);
          },
          error: (error) => {
            console.error('Error toggling subtask completion:', error);
          }
        });
    } else {
      // Update new task locally
      console.log('Subtask completion toggled in new task');
      this.taskService.setCurrentTask(updatedTask);
    }
  }

  // Method to get subtask count for display
  public getSubTaskCount(): { total: number, completed: number } {
    const currentTask = this.getCurrentTask();
    if (!currentTask) return { total: 0, completed: 0 };
    
    const total = currentTask.subTasks.length;
    const completed = currentTask.subTasks.filter(subtask => subtask.completed).length;
    return { total, completed };
  }

  // Method to get the current selected category for display
  public getCurrentCategory(): string {
    const currentTask = this.getCurrentTask();
    return currentTask?.categories || '';
  }

  // Method to check if task has unsaved changes (for new tasks)
  public hasUnsavedChanges(): boolean {
    const currentTask = this.getCurrentTask();
    if (!currentTask || currentTask.id) return false; // Existing tasks or no task
    
    // Check if new task has any content
    return !!(
      currentTask.title?.trim() ||
      currentTask.description?.trim() ||
      currentTask.categories ||
      currentTask.subTasks.length > 0
    );
  }

  // Method to get task summary for new tasks
  public getNewTaskSummary(): { title: string, category: string, subtasks: number, description: boolean } {
    const currentTask = this.getCurrentTask();
    if (!currentTask || currentTask.id) {
      return { title: '', category: '', subtasks: 0, description: false };
    }
    
    return {
      title: currentTask.title || '',
      category: currentTask.categories || 'No category',
      subtasks: currentTask.subTasks.length,
      description: !!currentTask.description?.trim()
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
