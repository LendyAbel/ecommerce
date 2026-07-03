import express from 'express';

import { authenticate } from '../../../middlewares/authMiddleware';
import * as addressController from '../controllers/addressControler';

const router = express.Router();
router.use(authenticate);

router.get('/', addressController.listAddresses);
router.post('/', addressController.createAddress);
router.patch('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;
