# Enhanced Subtask Management - New Task Creation Support

## New Feature: Subtasks for New Tasks

The TaskDetails component now supports adding subtasks even when creating a new task (before it's saved). This provides a seamless experience where users can build their task with subtasks and save everything together.

## How It Works

### 🔄 **Two-Mode Subtask Handling**

#### **Mode 1: New Task (Not Yet Saved)**
- Subtasks are stored locally in component state
- No API calls until the main task is created
- All subtasks are saved together with the main task

#### **Mode 2: Existing Task (Already Saved)**
- Subtasks are immediately saved via API
- Real-time updates across all components
- Individual subtask operations update the database

## Enhanced Methods

### **addSubTask() - Now Supports Both Modes**
```typescript
public addSubTask(subTask: string): void {
  if (!subTask.trim()) return;
  
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
    this.taskService.setCurrentTask(updatedTask);
  }
}
```

### **Enhanced createTask() - Includes Subtasks**
```typescript
public createTask(createTask: Tasks): void {
  // Get the current task state which might include subtasks added during creation
  const currentTaskWithSubtasks = this.getCurrentTask();
  const taskToCreate = {
    ...createTask,
    subTasks: currentTaskWithSubtasks?.subTasks || createTask.subTasks || []
  };

  this.taskService.addTask(taskToCreate)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        const createdTask = { 
          ...taskToCreate, 
          id: response.id || Date.now().toString() 
        };
        this.taskService.setCurrentTask(createdTask);
        
        console.log(`Task created successfully with ${createdTask.subTasks.length} subtasks!`);
      },
      error: (error) => {
        console.error('Error creating task:', error);
      }
    });
}
```

### **Updated canAddSubTasks() - More Permissive**
```typescript
public canAddSubTasks(): boolean {
  const currentTask = this.getCurrentTask();
  return !!currentTask && (!!currentTask.title || this.isNewTaskMode);
}
```

## New Utility Methods

### **removeSubTask() - Works for Both Modes**
```typescript
public removeSubTask(subtaskId: number): void {
  const currentTask = this.getCurrentTask();
  if (!currentTask) return;

  const updatedSubTasks = currentTask.subTasks.filter(subtask => subtask.id !== subtaskId);
  const updatedTask = { ...currentTask, subTasks: updatedSubTasks };

  if (currentTask.id && !this.isNewTaskMode) {
    // Update existing task via API
    this.taskService.updateTask(currentTask.id.toString(), updatedTask)
      .subscribe({
        next: () => this.taskService.setCurrentTask(updatedTask),
        error: (error) => console.error('Error removing subtask:', error)
      });
  } else {
    // Update new task locally
    this.taskService.setCurrentTask(updatedTask);
  }
}
```

### **toggleSubTaskCompletion() - Interactive Subtasks**
```typescript
public toggleSubTaskCompletion(subtaskId: number): void {
  const currentTask = this.getCurrentTask();
  if (!currentTask) return;

  const updatedSubTasks = currentTask.subTasks.map(subtask =>
    subtask.id === subtaskId 
      ? { ...subtask, completed: !subtask.completed }
      : subtask
  );

  const updatedTask = { ...currentTask, subTasks: updatedSubTasks };

  if (currentTask.id && !this.isNewTaskMode) {
    // API update for existing tasks
    this.taskService.updateTask(currentTask.id.toString(), updatedTask)
      .subscribe({
        next: () => this.taskService.setCurrentTask(updatedTask),
        error: (error) => console.error('Error toggling subtask:', error)
      });
  } else {
    // Local update for new tasks
    this.taskService.setCurrentTask(updatedTask);
  }
}
```

### **getSubTaskCount() - Progress Tracking**
```typescript
public getSubTaskCount(): { total: number, completed: number } {
  const currentTask = this.getCurrentTask();
  if (!currentTask) return { total: 0, completed: 0 };
  
  const total = currentTask.subTasks.length;
  const completed = currentTask.subTasks.filter(subtask => subtask.completed).length;
  return { total, completed };
}
```

## Template Usage Examples

### **Enhanced Subtask Section**
```html
<!-- Subtasks Section - Now works for both new and existing tasks -->
<div class="subtasks-section" *ngIf="canAddSubTasks()">
  <div class="subtasks-header">
    <h3>Subtasks</h3>
    <span class="subtask-count" *ngIf="getSubTaskCount().total > 0">
      {{ getSubTaskCount().completed }} / {{ getSubTaskCount().total }} completed
    </span>
    <span class="new-task-indicator" *ngIf="isNewTaskMode && getSubTaskCount().total > 0">
      (Will be saved with task)
    </span>
  </div>
  
  <!-- Add Subtask Form -->
  <div class="add-subtask">
    <input 
      [(ngModel)]="newSubTask"
      placeholder="Add new subtask"
      (keyup.enter)="addSubTask(newSubTask)"
      [disabled]="isSubmitting">
    <button 
      (click)="addSubTask(newSubTask)"
      [disabled]="!newSubTask.trim() || isSubmitting">
      Add
    </button>
  </div>

  <!-- Existing Subtasks with Enhanced Interactions -->
  <div class="subtasks-list" *ngIf="getCurrentTask()?.subTasks?.length > 0">
    <div *ngFor="let subtask of getCurrentTask()?.subTasks" 
         class="subtask-item"
         [class.completed]="subtask.completed">
      
      <!-- Subtask Checkbox -->
      <label class="subtask-checkbox">
        <input 
          type="checkbox" 
          [checked]="subtask.completed"
          (change)="toggleSubTaskCompletion(subtask.id)"
          [disabled]="isSubmitting">
        <span class="checkmark"></span>
      </label>
      
      <!-- Subtask Name -->
      <span class="subtask-name" [class.completed]="subtask.completed">
        {{ subtask.name }}
      </span>
      
      <!-- Remove Button -->
      <button 
        class="remove-subtask"
        (click)="removeSubTask(subtask.id)"
        [disabled]="isSubmitting"
        title="Remove subtask">
        ×
      </button>
    </div>
  </div>

  <!-- Progress Bar -->
  <div class="progress-container" *ngIf="getSubTaskCount().total > 0">
    <div class="progress-bar">
      <div class="progress-fill" 
           [style.width.%]="(getSubTaskCount().completed / getSubTaskCount().total) * 100">
      </div>
    </div>
    <small class="progress-text">
      {{ ((getSubTaskCount().completed / getSubTaskCount().total) * 100) | number:'1.0-0' }}% complete
    </small>
  </div>
</div>
```

### **Task Form with Subtask Preview**
```html
<form #taskForm="ngForm" (ngSubmit)="onSubmitTask(getCurrentTask())" *ngIf="getCurrentTask()">
  
  <!-- Task Title -->
  <div class="form-group">
    <label for="title">Task Title *</label>
    <input 
      id="title"
      [(ngModel)]="currentTask[0].title"
      name="title"
      placeholder="Enter task title"
      [disabled]="isSubmitting"
      required>
  </div>

  <!-- Subtask Summary for New Tasks -->
  <div class="subtask-summary" *ngIf="isNewTaskMode && getSubTaskCount().total > 0">
    <h4>Subtasks to be created ({{ getSubTaskCount().total }})</h4>
    <ul>
      <li *ngFor="let subtask of getCurrentTask()?.subTasks">
        {{ subtask.name }}
      </li>
    </ul>
  </div>

  <!-- Submit Button with Subtask Count -->
  <button 
    type="submit" 
    [disabled]="taskForm.invalid || isSubmitting"
    class="btn-primary">
    <span *ngIf="isSubmitting">
      {{ isNewTaskMode ? 'Creating...' : 'Updating...' }}
    </span>
    <span *ngIf="!isSubmitting">
      {{ isNewTaskMode ? 'Create Task' : 'Update Task' }}
      <span *ngIf="isNewTaskMode && getSubTaskCount().total > 0">
        (with {{ getSubTaskCount().total }} subtasks)
      </span>
    </span>
  </button>
</form>
```

## User Workflows

### **Workflow 1: Creating Task with Subtasks**
```
1. User clicks "New Task"
   → startNewTask() sets empty task
   → isNewTaskMode = true

2. User enters task title
   → Task title updated locally

3. User adds subtasks
   → addSubTask() updates local state only
   → Subtasks shown with "(Will be saved with task)" indicator

4. User clicks "Create Task"
   → createTask() includes all subtasks in API call
   → Task and all subtasks saved together
   → Switches to edit mode for further modifications
```

### **Workflow 2: Adding Subtasks to Existing Task**
```
1. User selects existing task
   → Task loaded into form
   → isNewTaskMode = false

2. User adds subtask
   → addSubTask() immediately calls API
   → Subtask saved and reflected across all components

3. User toggles subtask completion
   → toggleSubTaskCompletion() updates via API
   → Progress bar updates in real-time
```

## CSS Enhancements

```css
.subtasks-section {
  margin-top: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
}

.subtasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.subtask-count {
  font-size: 0.875rem;
  color: #6c757d;
}

.new-task-indicator {
  font-size: 0.75rem;
  color: #ffc107;
  font-style: italic;
}

.subtask-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.subtask-item.completed {
  opacity: 0.6;
}

.subtask-checkbox {
  display: flex;
  align-items: center;
  margin-right: 12px;
  cursor: pointer;
}

.subtask-name {
  flex-grow: 1;
  transition: all 0.2s ease;
}

.subtask-name.completed {
  text-decoration: line-through;
  color: #6c757d;
}

.remove-subtask {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.remove-subtask:hover {
  background-color: #f8d7da;
}

.progress-container {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #28a745;
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 4px;
  color: #6c757d;
}

.subtask-summary {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 12px;
  margin: 16px 0;
}

.subtask-summary h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #495057;
}

.subtask-summary ul {
  margin: 0;
  padding-left: 20px;
}

.subtask-summary li {
  font-size: 0.875rem;
  color: #6c757d;
}
```

## Benefits

### ✅ **Improved User Experience**
- Create tasks with subtasks in one flow
- No need to save task first before adding subtasks
- Visual feedback about what will be saved

### ✅ **Flexibility**
- Works for both new and existing tasks
- Seamless transition between modes
- Progressive enhancement as tasks are saved

### ✅ **Data Integrity**
- All subtasks saved atomically with main task
- No orphaned subtasks
- Consistent state management

### ✅ **Real-time Updates**
- Existing tasks update immediately
- New tasks show preview of what will be saved
- Progress tracking and completion status

The enhanced subtask functionality now provides a complete task creation and management experience!
