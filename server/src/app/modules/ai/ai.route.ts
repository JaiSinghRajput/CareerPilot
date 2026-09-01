import express, { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import multer from 'multer';
import { AIController } from './ai.controller.js';

const router: Router = express.Router();

// Configure multer for memory storage so we can read the buffer directly in pdf-parse
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

router.post('/chat', requireAuth, AIController.chat);
router.get('/resumes', requireAuth, AIController.getResumes);
router.post('/resume/upload', requireAuth, upload.single('resume'), AIController.uploadResume);
router.post('/resume/:id/analyze', requireAuth, AIController.analyzeResume);
router.get('/resume/:id', requireAuth, AIController.getResumeById);
router.delete('/resume/:id', requireAuth, AIController.deleteResume);

export default router;
