import express from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { authMiddleware } from '../../../core/middleware/auth.middleware.js';
import { handleUploadMiddleware } from '../../../core/middleware/upload.middleware.js';

const router = express.Router();

router.route('/image').post(authMiddleware, handleUploadMiddleware, uploadImage);
router.route('/').post(authMiddleware, handleUploadMiddleware, uploadImage);

export default router;
