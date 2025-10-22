import { supabase } from './supabase';

export type TaskStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';
export type TaskCategory = 'coding' | 'design' | 'translation' | 'math' | 'writing' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  budget: number;
  deadline: string;
  requirements: string[];
  status: TaskStatus;
  client_wallet: string;
  freelancer_wallet: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  category: TaskCategory;
  budget: number;
  deadline: string;
  requirements: string[];
}

export class TaskService {
  async createTask(clientWallet: string, taskData: CreateTaskData, taskId?: string): Promise<Task> {
    const taskRecord: any = {
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      budget: taskData.budget,
      deadline: taskData.deadline,
      requirements: taskData.requirements,
      status: 'open',
      client_wallet: clientWallet,
      freelancer_wallet: null,
    };

    if (taskId) {
      taskRecord.id = taskId;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskRecord])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw new Error(`Error creating task: ${error.message}`);
    }

    return data as Task;
  }

  // Get tasks by client wallet
  async getTasksByClient(clientWallet: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_wallet', clientWallet)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client tasks:', error);
      throw new Error(`Error fetching tasks: ${error.message}`);
    }

    return (data as Task[]) || [];
  }

  // Get all open tasks (for freelancers to browse)
  async getOpenTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching open tasks:', error);
      throw new Error(`Error fetching tasks: ${error.message}`);
    }

    return (data as Task[]) || [];
  }

  // Get task by ID
  async getTaskById(taskId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching task:', error);
      throw new Error(`Error fetching task: ${error.message}`);
    }

    return data as Task | null;
  }

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw new Error(`Error updating task: ${error.message}`);
    }

    return data as Task;
  }

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  // Assign freelancer to task
  async assignFreelancer(taskId: string, freelancerWallet: string): Promise<Task> {
    const { data, error} = await supabase
      .from('tasks')
      .update({
        freelancer_wallet: freelancerWallet,
        status: 'in-progress',
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning freelancer:', error);
      throw new Error(`Error assigning freelancer: ${error.message}`);
    }

    return data as Task;
  }

  // Get tasks assigned to freelancer
  async getTasksByFreelancer(freelancerWallet: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('freelancer_wallet', freelancerWallet)
      .in('status', ['in-progress', 'completed'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching freelancer tasks:', error);
      throw new Error(`Error fetching tasks: ${error.message}`);
    }

    return (data as Task[]) || [];
  }

  async submitWork(taskId: string, submissionData: any): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        Submission: submissionData,
        status: 'completed' 
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error submitting work:', error);
      throw new Error(`Error submitting work: ${error.message}`);
    }
  }
}

export const taskService = new TaskService();

