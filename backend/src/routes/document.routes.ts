import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getDocument, updateDocument, deleteDocument } from '../controllers/document.controller';

const router = Router();

router.use(authMiddleware);

router.get('/:id', getDocument);
router.patch('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
