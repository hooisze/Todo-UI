
export interface Tasks {
  id: string;
  title: string;
  categories: string;
  description: string;
  subTasks: SubTasks[],
  completed: boolean;
}

export interface SubTasks {
  id: number;
  name: string;
  completed: boolean;
}