import express, { Router } from 'express';
import { requireAuth } from '@clerk/express';
import multer from 'multer';
import { AIController } from './ai.controller.js';
const router = express.Router();
// Configure multer for memory storage so we can read the buffer directly in pdf-parse
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
router.post('/chat', requireAuth(), AIController.chat);
router.post('/resume/upload', requireAuth(), upload.single('resume'), AIController.uploadResume);
router.post('/resume/:id/analyze', requireAuth(), AIController.analyzeResume);
export default router;
//# sourceMappingURL=ai.route.js.map