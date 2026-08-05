import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', AuthController.login);

export { router as authRouter };
