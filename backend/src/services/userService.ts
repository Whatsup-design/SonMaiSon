import { createSupabaseUserClient, supabase } from '../lib/supabase';

export type DatabaseUser = Record<string, unknown>;
export type TodoInput = {
  title?: string;
  description?: string;
  is_completed?: boolean;
  priority?: string;
  due_date?: string;
};

export const getUserDataByAuthId = async (
  authId: string,
  accessToken?: string,
): Promise<DatabaseUser | null> => {
  const client = accessToken ? createSupabaseUserClient(accessToken) : supabase;

  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTodosByUserId = async (authId: string, accessToken: string) => {
  const { data, error } = await createSupabaseUserClient(accessToken)
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
  accessToken: string,
  todoInput: TodoInput,
) => {
  if (!todoInput.title) {
    throw new Error('Title is required');
  }

  const { data, error } = await createSupabaseUserClient(accessToken)
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
  accessToken: string,
  todoId: string,
  todoInput: TodoInput,
) => {
  const { data, error } = await createSupabaseUserClient(accessToken)
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

export const deleteTodo = async (
  authId: string,
  accessToken: string,
  todoId: string,
) => {
  const { error } = await createSupabaseUserClient(accessToken)
    .from('todos')
    .delete()
    .eq('id', todoId)
    .eq('user_id', authId);

  if (error) {
    throw new Error(error.message);
  }
};
