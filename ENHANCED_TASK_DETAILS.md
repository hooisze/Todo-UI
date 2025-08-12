# Enhanced TaskDetails Component - New Task Creation

## New Features Added

The TaskDetails component now supports both creating new tasks and editing existing ones, with automatic mode detection.

### 🆕 **New Properties**
- `isNewTaskMode: boolean` - Tracks if we're creating a new task
- `isSubmitting: boolean` - Tracks submission state to prevent double submissions

### 🆕 **New Methods**

#### **onSubmitTask(taskData: Tasks)**
Universal submit method that automatically determines whether to create or update:
```typescript
public onSubmitTask(taskData: Tasks): void {
  if (this.isNewTaskMode) {
    this.createTask(taskData);
  } else {
    this.updateTask(taskData);
  }
}
```

#### **startNewTask()**
Initializes the component for creating a new task:
```typescript
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
```

#### **cancelNewTask()**
Cancels new task creation and resets the form:
```typescript
public cancelNewTask(): void {
  this.taskService.resetCurrentTask();
  this.isNewTaskMode = false;
}
```

#### **Utility Methods**
- `hasCurrentTask()` - Check if there's a current task with content
- `canAddSubTasks()` - Check if subtasks can be added (task must be saved first)
- `getCurrentTask()` - Get the current task safely
- `toggleTaskCompletion()` - Toggle task completion status

## Template Usage Examples

### 1. **Basic Form with Create/Update Detection**
```html
<!-- task-details.html -->
<div class="task-details-container">
  
  <!-- Header with mode indication -->
  <div class="header">
    <h2>{{ isNewTaskMode ? 'Create New Task' : 'Edit Task' }}</h2>
    
    <button 
      *ngIf="!isNewTaskMode && !hasCurrentTask()" 
      (click)="startNewTask()"
      class="btn-new-task">
      + New Task
    </button>
  </div>

  <!-- Task Form -->
  <form #taskForm="ngForm" (ngSubmit)="onSubmitTask(getCurrentTask())" *ngIf="getCurrentTask()">
    
    <!-- Title Input -->
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

    <!-- Description Input -->
    <div class="form-group">
      <label for="description">Description</label>
      <textarea 
        id="description"
        [(ngModel)]="currentTask[0].description"
        name="description"
        placeholder="Enter task description"
        [disabled]="isSubmitting">
      </textarea>
    </div>

    <!-- Category Selection -->
    <div class="form-group">
      <label for="category">Category</label>
      <select 
        id="category"
        [(ngModel)]="currentTask[0].categories"
        name="category"
        (change)="onChangeCategory({value: $event.target.value})"
        [disabled]="isSubmitting">
        <option value="">Select Category</option>
        <option *ngFor="let category of taskService.categories$ | async" 
                [value]="category.value">
          {{ category.label }}
        </option>
      </select>
    </div>

    <!-- Status Toggle (only for existing tasks) -->
    <div class="form-group" *ngIf="!isNewTaskMode">
      <label>
        <input 
          type="checkbox"
          [(ngModel)]="currentTask[0].completed"
          name="completed"
          (change)="toggleTaskCompletion()"
          [disabled]="isSubmitting">
        Mark as Completed
      </label>
    </div>

    <!-- Action Buttons -->
    <div class="form-actions">
      <button 
        type="submit" 
        [disabled]="taskForm.invalid || isSubmitting"
        class="btn-primary">
        <span *ngIf="isSubmitting">{{ isNewTaskMode ? 'Creating...' : 'Updating...' }}</span>
        <span *ngIf="!isSubmitting">{{ isNewTaskMode ? 'Create Task' : 'Update Task' }}</span>
      </button>

      <button 
        type="button" 
        (click)="cancelNewTask()" 
        *ngIf="isNewTaskMode"
        [disabled]="isSubmitting"
        class="btn-secondary">
        Cancel
      </button>
    </div>
  </form>

  <!-- Subtasks Section (only for saved tasks) -->
  <div class="subtasks-section" *ngIf="canAddSubTasks()">
    <h3>Subtasks</h3>
    
    <!-- Add Subtask Form -->
    <div class="add-subtask">
      <input 
        [(ngModel)]="newSubTask"
        placeholder="Add new subtask"
        (keyup.enter)="addSubTask(newSubTask)">
      <button 
        (click)="addSubTask(newSubTask)"
        [disabled]="!newSubTask.trim()">
        Add
      </button>
    </div>

    <!-- Existing Subtasks -->
    <div class="subtasks-list">
      <div *ngFor="let subtask of currentTask[0].subTasks" class="subtask-item">
        <label>
          <input type="checkbox" [(ngModel)]="subtask.completed">
          {{ subtask.name }}
        </label>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div class="empty-state" *ngIf="!getCurrentTask()">
    <p>No task selected</p>
    <button (click)="startNewTask()" class="btn-primary">
      Create New Task
    </button>
  </div>

</div>
```

### 2. **Advanced Form with Validation**
```html
<form #taskForm="ngForm" (ngSubmit)="onSubmitTask(getCurrentTask())" *ngIf="getCurrentTask()">
  
  <!-- Title with validation -->
  <div class="form-group">
    <label for="title">Task Title *</label>
    <input 
      id="title"
      [(ngModel)]="currentTask[0].title"
      name="title"
      #titleInput="ngModel"
      placeholder="Enter task title"
      [disabled]="isSubmitting"
      required
      minlength="3"
      maxlength="100">
    
    <div *ngIf="titleInput.invalid && titleInput.touched" class="error-messages">
      <small *ngIf="titleInput.errors?.['required']">Title is required</small>
      <small *ngIf="titleInput.errors?.['minlength']">Minimum 3 characters required</small>
      <small *ngIf="titleInput.errors?.['maxlength']">Maximum 100 characters allowed</small>
    </div>
  </div>

  <!-- Progress indicator -->
  <div class="progress-bar" *ngIf="isSubmitting">
    <div class="progress-fill"></div>
  </div>

</form>
```

## Component Integration

### **From Task List Component**
```typescript
// task-list.ts
public selectTask(task: Tasks): void {
  this.taskService.setCurrentTask(task);
  // This will automatically set isNewTaskMode = false in task-details
}
```

### **From Main Page Component**
```typescript
// main-page.ts
public createNewTask(): void {
  // Reset current task to trigger new task mode
  this.taskService.resetCurrentTask();
  // Navigate to task details or ensure task-details component is visible
}
```

## Workflow Examples

### 1. **Creating a New Task**
```
1. User clicks "New Task" button
   → startNewTask() is called
   → isNewTaskMode = true
   → Empty task form appears

2. User fills out form and clicks "Create Task"
   → onSubmitTask() calls createTask()
   → Task is saved via API
   → New task becomes current task
   → isNewTaskMode = false (switches to edit mode)
   → User can now add subtasks
```

### 2. **Editing Existing Task**
```
1. User selects task from task list
   → setCurrentTask() is called
   → isNewTaskMode = false
   → Form populated with task data

2. User modifies form and clicks "Update Task"
   → onSubmitTask() calls updateTask()
   → Task is updated via API
   → Changes reflect across all components
```

### 3. **Adding Subtasks**
```
1. Task must be saved first (has ID)
   → canAddSubTasks() returns true
   → Subtask section appears

2. User adds subtask
   → addSubTask() updates the task with new subtask
   → Task is saved via API
   → Subtask appears in list
```

## CSS Classes for Styling

```css
.task-details-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  background: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.error-messages {
  color: #dc3545;
  font-size: 0.875rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  animation: progress 1s infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}
```

## Benefits

### ✅ **Seamless Experience**
- Single component handles both create and edit modes
- Automatic mode detection
- Smooth transitions between modes

### ✅ **Data Integrity**
- Prevents adding subtasks to unsaved tasks
- Validates required fields
- Prevents double submissions

### ✅ **User Feedback**
- Loading states during operations
- Clear mode indicators
- Validation messages

### ✅ **Reactive Integration**
- Automatic updates across all components
- Real-time synchronization
- Memory-safe operations

The enhanced TaskDetails component now provides a complete task management interface that handles the full lifecycle from creation to editing!
