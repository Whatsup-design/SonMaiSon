// Mock project pause:
// User/todo controllers are intentionally commented out for now.
// Keep auth + middleware active while the app is being prepared for competition.

// import { Request, Response } from 'express';
// import {
//   createTodo,
//   deleteTodo,
//   getTodosByUserId,
//   updateTodo,
// } from '../services/userService';

// const getAuthId = (req: Request) => {
//   const authId = req.authUser?.id;

//   if (!authId) {
//     throw new Error('Authenticated user not found');
//   }

//   return authId;
// };

// const getAccessToken = (req: Request) => {
//   const accessToken = req.accessToken;

//   if (!accessToken) {
//     throw new Error('Access token not found');
//   }

//   return accessToken;
// };

// const getTodoId = (req: Request) => String(req.params.id);

// export const dashboardController = async (req: Request, res: Response) => {};
// export const getTodosController = async (req: Request, res: Response) => {};
// export const createTodoController = async (req: Request, res: Response) => {};
// export const updateTodoController = async (req: Request, res: Response) => {};
// export const deleteTodoController = async (req: Request, res: Response) => {};

// export {};
