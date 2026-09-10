import express, { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import multer from 'multer';
import { AIController } from './ai.controller.js';
const router = express.Router();
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
router.get('/projects/recommend', requireAuth, AIController.getRecommendations);
router.post('/projects/recommend', requireAuth, AIController.recommendProjects);
router.get('/chat-history', requireAuth, AIController.getChatHistory);
router.get('/chats', requireAuth, AIController.getChats);
router.delete('/chats/:id', requireAuth, AIController.deleteChat);
router.post('/chats/:id/state', requireAuth, AIController.updateChatState);
export default router;
//# sourceMappingURL=ai.route.js.map