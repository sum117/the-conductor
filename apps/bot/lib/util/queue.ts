export interface Task {
  id: number | string;
  execute: () => Promise<void>;
}

export class Queue {
  private tasks: Map<number | string, Task>;
  private isProcessing: boolean;

  constructor() {
    this.tasks = new Map();
    this.isProcessing = false;
  }

  get length() {
    return this.tasks.size;
  }

  private async process() {
    while (this.tasks.size > 0) {
      const taskId = this.tasks.keys().next().value;
      const task = this.tasks.get(taskId);

      if (task) {
        try {
          await task.execute();
        } catch (error) {
          console.error("Error executing task with ID:", task.id, error);
        }
      }
      this.tasks.delete(taskId);
    }
    this.isProcessing = false;
  }

  enqueue(task: Task) {
    this.tasks.set(task.id, task);
    if (!this.isProcessing) {
      this.isProcessing = true;
      this.process();
    }
    return task.id;
  }

  find(taskId: number | string) {
    return this.tasks.get(taskId);
  }

  findPosition(taskId: number | string): number {
    const taskIds = Array.from(this.tasks.keys());
    return taskIds.indexOf(taskId);
  }
}
