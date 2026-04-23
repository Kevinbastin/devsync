import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { updateSnippet, deleteSnippet } from '../controllers/snippet.controller';

const router = Router();

router.use(authMiddleware);

router.patch('/:snippetId', updateSnippet);
router.delete('/:snippetId', deleteSnippet);

export default router;
