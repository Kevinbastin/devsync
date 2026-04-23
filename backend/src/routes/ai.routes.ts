import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiLimiter } from '../middleware/rate-limit.middleware';
import { aiComplete } from '../controllers/ai.controller';

const router = Router();

router.use(authMiddleware);
router.post('/complete', aiLimiter, aiComplete);

export default router;
