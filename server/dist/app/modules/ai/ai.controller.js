import { AIService } from './ai.service.js';
import { getAuth } from '@clerk/express';
export class AIController {
    static async chat(req, res) {
        try {
            const { prompt, chatId } = req.body;
            if (!prompt) {
                res.status(400).json({ success: false, message: 'Prompt is required' });
                return;
            }
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const result = await AIService.processChat(prompt, clerkId, chatId);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to process AI request' });
        }
    }
    static async uploadResume(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            // Pass the file buffer to the service for PDF parsing
            const result = await AIService.processResumeUpload(req.file.buffer, req.file.originalname, clerkId);
            res.status(200).json({
                success: true,
                message: 'Resume uploaded and parsed successfully',
                data: result
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to upload resume' });
        }
    }
    static async analyzeResume(req, res) {
        try {
            const { id } = req.params;
            const resumeId = parseInt(id || '', 10);
            if (isNaN(resumeId)) {
                res.status(400).json({ success: false, message: 'Invalid resume ID' });
                return;
            }
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const result = await AIService.analyzeResume(resumeId, clerkId);
            res.status(200).json({
                success: true,
                message: 'Resume analyzed successfully',
                data: result
            });
        }
        catch (error) {
            console.error('Analyze error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to analyze resume' });
        }
    }
    static async getResumes(req, res) {
        try {
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const resumes = await AIService.getResumes(clerkId);
            res.status(200).json({
                success: true,
                data: resumes
            });
        }
        catch (error) {
            console.error('Get resumes error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to get resumes' });
        }
    }
    static async getResumeById(req, res) {
        try {
            const { id } = req.params;
            const resumeId = parseInt(id || '', 10);
            if (isNaN(resumeId)) {
                res.status(400).json({ success: false, message: 'Invalid resume ID' });
                return;
            }
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const resume = await AIService.getResumeById(resumeId, clerkId);
            res.status(200).json({
                success: true,
                data: resume
            });
        }
        catch (error) {
            console.error('Get resume by id error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to get resume' });
        }
    }
    static async deleteResume(req, res) {
        try {
            const { id } = req.params;
            const resumeId = parseInt(id || '', 10);
            if (isNaN(resumeId)) {
                res.status(400).json({ success: false, message: 'Invalid resume ID' });
                return;
            }
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            await AIService.deleteResume(resumeId, clerkId);
            res.status(200).json({
                success: true,
                message: 'Resume deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete resume error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete resume' });
        }
    }
    static async getRecommendations(req, res) {
        try {
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const record = await AIService.getRecommendations(clerkId);
            res.status(200).json({
                success: true,
                data: record
            });
        }
        catch (error) {
            console.error('Get recommendations error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to get recommendations' });
        }
    }
    static async recommendProjects(req, res) {
        try {
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            await AIService.recommendProjects(clerkId);
            res.status(200).json({
                success: true,
                message: 'Project recommendation generation started.'
            });
        }
        catch (error) {
            console.error('Recommend projects error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to start project recommendation' });
        }
    }
    static async getChatHistory(req, res) {
        try {
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const chatIdParam = req.query.chatId;
            let data;
            if (chatIdParam) {
                const chatId = parseInt(chatIdParam, 10);
                if (isNaN(chatId)) {
                    res.status(400).json({ success: false, message: 'Invalid chat ID' });
                    return;
                }
                data = await AIService.getChatById(chatId, clerkId);
            }
            else {
                data = await AIService.getLatestChat(clerkId);
            }
            res.status(200).json({
                success: true,
                data: data
            });
        }
        catch (error) {
            console.error('Get chat history error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to get chat history' });
        }
    }
    static async getChats(req, res) {
        try {
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const chats = await AIService.getChatsList(clerkId);
            res.status(200).json({ success: true, data: chats });
        }
        catch (error) {
            console.error('Get chats error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to get chats' });
        }
    }
    static async deleteChat(req, res) {
        try {
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const chatId = parseInt(req.params.id, 10);
            if (isNaN(chatId)) {
                res.status(400).json({ success: false, message: 'Invalid chat ID' });
                return;
            }
            await AIService.deleteChat(chatId, clerkId);
            res.status(200).json({ success: true, message: 'Chat deleted successfully' });
        }
        catch (error) {
            console.error('Delete chat error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete chat' });
        }
    }
    static async updateChatState(req, res) {
        try {
            const { id } = req.params;
            const { state } = req.body;
            const chatId = parseInt(id || '', 10);
            if (isNaN(chatId)) {
                res.status(400).json({ success: false, message: 'Invalid chat ID' });
                return;
            }
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            await AIService.updateChatState(chatId, clerkId, state);
            res.status(200).json({
                success: true,
                message: 'Chat state updated successfully',
            });
        }
        catch (error) {
            console.error('Update chat state error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to update chat state' });
        }
    }
}
//# sourceMappingURL=ai.controller.js.map