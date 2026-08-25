import db from '../../../db/db.js';
import { usersTable, chatsTable, messagesTable, resumesTable } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { aiGateway, askAI } from '../../../ai/index.js';
import { CloudinaryService } from '../../utils/cloudinary.js';
export class AIService {
    static async processChat(prompt, clerkId, chatId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
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
        return {
            chatId: currentChatId,
            reply: aiText,
            fullResult: result
        };
    }
    static async processResumeUpload(fileBuffer, originalFileName, clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        // 1. Extract text from PDF
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const pdfData = await pdfParse(fileBuffer);
        const extractedText = pdfData.text;
        if (!extractedText || extractedText.trim() === '') {
            throw new Error('Failed to extract text from the provided PDF.');
        }
        // 2. Use AI to extract structured JSON data
        const parsePrompt = `Extract the following structured information from the provided resume text.
Return ONLY valid JSON matching this structure exactly (no markdown formatting, no code blocks around the JSON):
{
  "name": "Full Name",
  "skills": ["skill1", "skill2"],
  "experience": [{"company": "Name", "role": "Title", "duration": "Dates"}],
  "education": [{"institution": "Name", "degree": "Title"}]
}

Resume Text:
${extractedText.substring(0, 4000)} // Limit length if necessary
`;
        const extractionMessages = [
            { role: 'system', content: [{ type: 'text', text: 'You are a data extraction bot. You only output pure JSON without any surrounding text or markdown blocks.' }] },
            { role: 'user', content: [{ type: 'text', text: parsePrompt }] }
        ];
        const result = await aiGateway.run(extractionMessages);
        let aiText = '';
        if (result.response?.message) {
            const msg = result.response.message;
            if (msg.content) {
                const textContent = msg.content.find(c => c.type === 'text');
                aiText = textContent ? textContent.text : '{}';
            }
        }
        // Clean up potential markdown formatting if the model still adds it
        aiText = aiText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        let parsedData = {};
        try {
            parsedData = JSON.parse(aiText);
        }
        catch (e) {
            console.error("Failed to parse LLM JSON output:", aiText);
            throw new Error('AI returned invalid JSON data.');
        }
        // 3. Upload raw file to Cloudinary
        let cloudUrl = '';
        try {
            // Assuming pdf by default based on typical resume format, could also use originalFileName extension
            cloudUrl = await CloudinaryService.uploadBuffer(fileBuffer, originalFileName);
        }
        catch (e) {
            console.error("Failed to upload resume to Cloudinary:", e);
            throw new Error('Failed to upload file to storage.');
        }
        // 4. Save to database
        const resumeRows = await db.insert(resumesTable).values({
            userId: dbUserId,
            originalFileName: originalFileName,
            storageUrl: cloudUrl,
            parsedData: parsedData,
            atsScore: 0, // Could be updated later
            summary: 'Automatically parsed resume',
        }).returning({ id: resumesTable.id });
        return {
            resumeId: resumeRows[0].id,
            parsedData: parsedData,
        };
    }
    static async analyzeResume(resumeId, clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        // Fetch the resume
        const resumeRows = await db.select().from(resumesTable).where(eq(resumesTable.id, resumeId)).limit(1);
        const resume = resumeRows[0];
        if (!resume || resume.userId !== dbUserId) {
            throw new Error('Resume not found or unauthorized');
        }
        if (!resume.parsedData) {
            throw new Error('Resume has no parsed data to analyze');
        }
        const analysisPrompt = `Analyze the following structured resume data.
Evaluate the candidate's skills, experience, and overall profile.
Provide a professional summary, an ATS score out of 100, and a list of specific feedback or improvements.
Return ONLY valid JSON matching this structure exactly (no markdown formatting, no code blocks):
{
  "atsScore": 85,
  "summary": "A concise professional summary of the candidate...",
  "feedback": ["Feedback point 1", "Feedback point 2"]
}

Resume Data:
${JSON.stringify(resume.parsedData)}
`;
        const extractionMessages = [
            { role: 'system', content: [{ type: 'text', text: 'You are an expert AI career counselor and ATS evaluator. You only output pure JSON without any surrounding text or markdown blocks.' }] },
            { role: 'user', content: [{ type: 'text', text: analysisPrompt }] }
        ];
        const result = await aiGateway.run(extractionMessages);
        let aiText = '';
        if (result.response?.message) {
            const msg = result.response.message;
            if (msg.content) {
                const textContent = msg.content.find(c => c.type === 'text');
                aiText = textContent ? textContent.text : '{}';
            }
        }
        aiText = aiText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        let analysisResult;
        try {
            analysisResult = JSON.parse(aiText);
        }
        catch (e) {
            console.error("Failed to parse LLM JSON analysis output:", aiText);
            throw new Error('AI returned invalid analysis format.');
        }
        // Update database with analysis
        await db.update(resumesTable)
            .set({
            atsScore: analysisResult.atsScore,
            summary: analysisResult.summary,
        })
            .where(eq(resumesTable.id, resumeId));
        return analysisResult;
    }
}
//# sourceMappingURL=ai.service.js.map