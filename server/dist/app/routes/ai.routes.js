import express, { Router } from 'express';
import { askAI } from '../../ai/index.js';
import { requireAuth } from '@clerk/express';
import multer from 'multer';
import db from '../../db/db.js';
import { usersTable, chatsTable, messagesTable, resumesTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
const router = express.Router();
const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
router.post('/chat', requireAuth(), async (req, res) => {
    try {
        const { prompt, chatId } = req.body;
        if (!prompt) {
            res.status(400).json({ success: false, message: 'Prompt is required' });
            return;
        }
        const clerkId = req.auth?.userId;
        if (!clerkId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!user.length) {
            res.status(404).json({ success: false, message: 'User not found in database' });
            return;
        }
        const dbUserId = user[0].id;
        let currentChatId = chatId;
        if (!currentChatId) {
            // Create new chat
            const chatRows = await db.insert(chatsTable).values({
                userId: dbUserId,
                title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
            }).returning({ id: chatsTable.id });
            currentChatId = chatRows[0].id;
        }
        // Save user message
        await db.insert(messagesTable).values({
            chatId: currentChatId,
            role: 'user',
            content: prompt,
        });
        const result = await askAI(prompt);
        let aiText = '';
        let aiToolCalls = null;
        if (result.response?.message) {
            const msg = result.response.message;
            if (msg.content) {
                const textContent = msg.content.find(c => c.type === 'text');
                aiText = textContent ? textContent.text : 'No text response generated.';
            }
            aiToolCalls = msg.toolCalls || null;
        }
        // Save AI message
        await db.insert(messagesTable).values({
            chatId: currentChatId,
            role: 'assistant',
            content: aiText,
            toolCalls: aiToolCalls,
        });
        res.status(200).json({
            success: true,
            data: {
                chatId: currentChatId,
                reply: aiText,
                fullResult: result
            }
        });
    }
    catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, message: 'Failed to process AI request', error: error.message });
    }
});
router.post('/resume/upload', requireAuth(), upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const clerkId = req.auth?.userId;
        if (!clerkId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!user.length) {
            res.status(404).json({ success: false, message: 'User not found in database' });
            return;
        }
        const dbUserId = user[0].id;
        const mockParsedData = {
            name: user[0].name,
            skills: ['JavaScript', 'TypeScript', 'Node.js'],
            experience: [],
        };
        const resumeRows = await db.insert(resumesTable).values({
            userId: dbUserId,
            originalFileName: req.file.originalname,
            storageUrl: 'mock-storage-url/' + req.file.filename,
            parsedData: mockParsedData,
            atsScore: 75,
            summary: 'An experienced developer with strong JavaScript skills.',
        }).returning({ id: resumesTable.id });
        res.status(200).json({
            success: true,
            message: 'Resume uploaded and parsed successfully',
            data: {
                resumeId: resumeRows[0].id,
                parsedData: mockParsedData,
            }
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload resume', error: error.message });
    }
});
export default router;
//# sourceMappingURL=ai.routes.js.map