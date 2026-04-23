import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createColumn, updateColumn, deleteColumn, createTask, updateTask, deleteTask, moveTask } from '../controllers/task.controller';

const router = Router();

router.use(authMiddleware);

// Column operations
router.post('/boards/:boardId/columns', createColumn);
router.patch('/columns/:columnId', updateColumn);
router.delete('/columns/:columnId', deleteColumn);

// Task operations
router.post('/columns/:columnId/tasks', createTask);
router.patch('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);
router.patch('/tasks/:taskId/move', moveTask);

export default router;
