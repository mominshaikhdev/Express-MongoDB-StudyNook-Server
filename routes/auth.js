import { Router } from 'express';
import { register, login, googleAuth, logout, me } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
export default router;
