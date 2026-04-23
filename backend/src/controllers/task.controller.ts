import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createColumnSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  position: z.number().optional(),
  columnId: z.string().optional(),
});

export async function getBoards(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = String(req.params.workspaceId || req.params.id);
    const boards = await prisma.board.findMany({
      where: { workspaceId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignee: { select: { id: true, name: true, avatar: true } },
                labels: true,
              },
            },
          },
        },
      },
    });
    res.json(boards);
  } catch (error) {
    next(error);
  }
}

export async function createBoard(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = String(req.params.workspaceId || req.params.id);
    const board = await prisma.board.create({
      data: {
        name: req.body.name,
        workspaceId,
        columns: {
          create: [
            { name: 'To Do', position: 0 },
            { name: 'In Progress', position: 1 },
            { name: 'Done', position: 2 },
          ],
        },
      },
      include: { columns: { orderBy: { position: 'asc' } } },
    });
    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
}

export async function createColumn(req: Request, res: Response, next: NextFunction) {
  try {
    const boardId = String(req.params.boardId);
    const maxPos = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const column = await prisma.column.create({
      data: {
        name: req.body.name,
        boardId,
        position: (maxPos?.position ?? -1) + 1,
      },
    });
    res.status(201).json(column);
  } catch (error) {
    next(error);
  }
}

export async function updateColumn(req: Request, res: Response, next: NextFunction) {
  try {
    const columnId = String(req.params.columnId);
    const column = await prisma.column.update({
      where: { id: columnId },
      data: { name: req.body.name },
    });
    res.json(column);
  } catch (error) {
    next(error);
  }
}

export async function deleteColumn(req: Request, res: Response, next: NextFunction) {
  try {
    const columnId = String(req.params.columnId);
    await prisma.column.delete({ where: { id: columnId } });
    res.json({ message: 'Column deleted' });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const columnId = String(req.params.columnId);
    const { title, description, priority, assigneeId, dueDate } = req.body;

    const maxPos = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        position: (maxPos?.position ?? -1) + 1,
        columnId,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: true,
      },
    });

    // Get workspace id for activity logging
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });

    if (column) {
      const board = await prisma.board.findUnique({
        where: { id: column.boardId },
        select: { workspaceId: true },
      });

      await prisma.activity.create({
        data: {
          type: 'task_created',
          message: `created task "${title}"`,
          userId: req.user!.userId,
          workspaceId: board!.workspaceId,
        },
      });
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = String(req.params.taskId);
    const { title, description, priority, assigneeId, dueDate, position, columnId } = req.body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(position !== undefined && { position }),
        ...(columnId !== undefined && { columnId }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: true,
      },
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = String(req.params.taskId);
    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
}

export async function moveTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { columnId, position } = req.body;
    const taskId = String(req.params.taskId);

    // Update positions of other tasks in target column
    await prisma.task.updateMany({
      where: {
        columnId,
        position: { gte: position },
      },
      data: {
        position: { increment: 1 },
      },
    });

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { columnId, position },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: true,
      },
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
}
