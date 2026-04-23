import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireOwner, requireEditor, requireWorkspaceMember } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace,
  inviteMember, updateMemberRole, removeMember,
  createWorkspaceSchema, inviteMemberSchema,
} from '../controllers/workspace.controller';
import {
  getDocuments, createDocument, getDocument, updateDocument, deleteDocument,
  createDocumentSchema,
} from '../controllers/document.controller';
import {
  getBoards, createBoard, createColumn, updateColumn, deleteColumn,
  createTask, updateTask, deleteTask, moveTask,
} from '../controllers/task.controller';
import {
  getSnippets, createSnippet, updateSnippet, deleteSnippet,
} from '../controllers/snippet.controller';

const router = Router();

// All workspace routes require auth
router.use(authMiddleware);

// Workspace CRUD
router.post('/', validate(createWorkspaceSchema), createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', requireWorkspaceMember(), getWorkspace);
router.patch('/:id', requireOwner(), updateWorkspace);
router.delete('/:id', requireOwner(), deleteWorkspace);

// Members
router.post('/:id/invite', requireOwner(), validate(inviteMemberSchema), inviteMember);
router.patch('/:id/members/:memberId', requireOwner(), updateMemberRole);
router.delete('/:id/members/:memberId', requireOwner(), removeMember);

// Documents
router.get('/:id/documents', requireWorkspaceMember(), getDocuments);
router.post('/:id/documents', requireEditor(), validate(createDocumentSchema), createDocument);

// Boards & Tasks
router.get('/:id/boards', requireWorkspaceMember(), getBoards);
router.post('/:id/boards', requireEditor(), createBoard);

// Snippets
router.get('/:id/snippets', requireWorkspaceMember(), getSnippets);
router.post('/:id/snippets', requireEditor(), createSnippet);

export default router;
