import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export const createDocumentSchema = z.object({
  title: z.string().max(200).optional(),
  parentId: z.string().optional(),
  icon: z.string().max(10).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.any().optional(),
  icon: z.string().max(10).optional(),
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = req.params.workspaceId || req.params.id;
    const documents = await prisma.document.findMany({
      where: { workspaceId, isArchived: false, parentId: null },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        children: {
          where: { isArchived: false },
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            children: {
              where: { isArchived: false },
              select: { id: true, title: true, icon: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(documents);
  } catch (error) {
    next(error);
  }
}

export async function getDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.docId || req.params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        children: {
          where: { isArchived: false },
          select: { id: true, title: true, icon: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
}

export async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = req.params.workspaceId || req.params.id;
    const { title, parentId, icon } = req.body;

    const document = await prisma.document.create({
      data: {
        title: title || 'Untitled',
        icon: icon || '📄',
        authorId: req.user!.userId,
        workspaceId,
        parentId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: 'doc_created',
        message: `created document "${document.title}"`,
        userId: req.user!.userId,
        workspaceId,
      },
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, icon, isPublished, isArchived } = req.body;

    const document = await prisma.document.update({
      where: { id: req.params.docId || req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(icon !== undefined && { icon }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isArchived !== undefined && { isArchived }),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json(document);
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    // Soft delete
    await prisma.document.update({
      where: { id: req.params.docId || req.params.id },
      data: { isArchived: true },
    });
    res.json({ message: 'Document archived' });
  } catch (error) {
    next(error);
  }
}
