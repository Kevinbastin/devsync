import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createSnippetSchema = z.object({
  title: z.string().min(1).max(200),
  code: z.string().min(1),
  language: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
});

export async function getSnippets(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = req.params.workspaceId || req.params.id;
    const snippets = await prisma.snippet.findMany({
      where: { workspaceId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(snippets);
  } catch (error) { next(error); }
}

export async function createSnippet(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = req.params.workspaceId || req.params.id;
    const { title, code, language, description } = req.body;
    const snippet = await prisma.snippet.create({
      data: { title, code, language, description, authorId: req.user!.userId, workspaceId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
    await prisma.activity.create({
      data: { type: 'snippet_created', message: `added snippet "${title}"`, userId: req.user!.userId, workspaceId },
    });
    res.status(201).json(snippet);
  } catch (error) { next(error); }
}

export async function updateSnippet(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, code, language, description } = req.body;
    const snippet = await prisma.snippet.update({
      where: { id: req.params.snippetId },
      data: { ...(title && { title }), ...(code && { code }), ...(language && { language }), ...(description !== undefined && { description }) },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
    res.json(snippet);
  } catch (error) { next(error); }
}

export async function deleteSnippet(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.snippet.delete({ where: { id: req.params.snippetId } });
    res.json({ message: 'Snippet deleted' });
  } catch (error) { next(error); }
}
