import { Request, Response } from 'express';
import {
  createTodo,
  deleteTodo,
  getTodosByUserId,
  getUserDataByAuthId,
  updateTodo,
} from '../services/userService';

const getAuthId = (req: Request) => {
  const authId = req.authUser?.id;

  if (!authId) {
    throw new Error('Authenticated user not found');
  }

  return authId;
};

const getTodoId = (req: Request) => String(req.params.id);

export const dashboardController = async (req: Request, res: Response) => {
  try {
    const authId = getAuthId(req);
    const user = await getUserDataByAuthId(authId);
    const todos = await getTodosByUserId(authId);

    res.status(200).json({
      message: 'User Dashboard',
      user,
      todos,
      payload: req.tokenPayload,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to load dashboard',
    });
  }
};

export const getTodosController = async (req: Request, res: Response) => {
  try {
    const authId = getAuthId(req);
    const todos = await getTodosByUserId(authId);

    res.status(200).json({
      message: 'Todos fetched successfully',
      todos,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to fetch todos',
    });
  }
};

export const createTodoController = async (req: Request, res: Response) => {
  try {
    const authId = getAuthId(req);
    const todo = await createTodo(authId, req.body);

    res.status(201).json({
      message: 'Todo created successfully',
      todo,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to create todo',
    });
  }
};

export const updateTodoController = async (req: Request, res: Response) => {
  try {
    const authId = getAuthId(req);
    const todo = await updateTodo(authId, getTodoId(req), req.body);

    res.status(200).json({
      message: 'Todo updated successfully',
      todo,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to update todo',
    });
  }
};

export const deleteTodoController = async (req: Request, res: Response) => {
  try {
    const authId = getAuthId(req);
    await deleteTodo(authId, getTodoId(req));

    res.status(200).json({
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to delete todo',
    });
  }
};
