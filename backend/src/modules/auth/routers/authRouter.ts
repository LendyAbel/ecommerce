import express from 'express';

import { authenticate } from '../../../middlewares/authMiddleware';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.delete('/me', authenticate, authController.deleteMe);

export default router;
