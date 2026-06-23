import express from 'express';
import { authenticate, requireAdmin } from '../../../middlewares/authMiddleware';
import * as usersController from '../controllers/usersController';

const router = express.Router();

// All routes here are admin-only.
router.use(authenticate, requireAdmin);

router.get('/', usersController.listUsers);
router.delete('/:id', usersController.deleteUser);

export default router;
