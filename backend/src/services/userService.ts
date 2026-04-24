import { supabase } from '../lib/supabase';

export type DatabaseUser = Record<string, unknown>;
export type TodoInput = {
  title?: string;
  description?: string;
  is_completed?: boolean;
  priority?: string;
  due_date?: string;
};

export const getUserDataByAuthId = async (authId: string): Promise<DatabaseUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTodosByUserId = async (authId: string) => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', authId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createTodo = async (
  authId: string,
  todoInput: TodoInput,
) => {
  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: authId,
      title: todoInput.title,
      description: todoInput.description,
      is_completed: todoInput.is_completed ?? false,
      priority: todoInput.priority,
      due_date: todoInput.due_date,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateTodo = async (
  authId: string,
  todoId: string,
  todoInput: TodoInput,
) => {
  const { data, error } = await supabase
    .from('todos')
    .update(todoInput)
    .eq('id', todoId)
    .eq('user_id', authId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteTodo = async (authId: string, todoId: string) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', todoId)
    .eq('user_id', authId);

  if (error) {
    throw new Error(error.message);
  }
};
