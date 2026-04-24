import { createSupabaseUserClient, supabase } from '../lib/supabase';
import { randomUUID } from 'crypto';

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
      id: randomUUID(),
      user_id: authId,
      title: todoInput.title,
      description: todoInput.description ?? null,
      is_completed: todoInput.is_completed ?? false,
      priority: todoInput.priority ?? null,
      due_date: todoInput.due_date ?? null,
      created_at: new Date().toISOString(),
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
  const updateInput = Object.fromEntries(
    Object.entries(todoInput).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await createSupabaseUserClient(accessToken)
    .from('todos')
    .update(updateInput)
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
