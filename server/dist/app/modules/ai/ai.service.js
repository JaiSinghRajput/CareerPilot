import db from '../../../db/db.js';
import { usersTable, chatsTable, messagesTable, resumesTable, projectRecommendationsTable } from '../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { aiGateway, askAI, SYSTEM_PROMPT } from '../../../ai/index.js';
import { CloudinaryService } from '../../utils/cloudinary.js';
export class AIService {
    static async processChat(prompt, clerkId, chatId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const user = userRows[0];
        const dbUserId = user.id;
        let currentChatId = chatId;
        let chatState = "READY_FOR_CHAT";
        if (!currentChatId) {
            const chatRows = await db.insert(chatsTable).values({
                userId: dbUserId,
                title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
                chatState: "READY_FOR_CHAT"
            }).returning({ id: chatsTable.id, chatState: chatsTable.chatState });
            currentChatId = chatRows[0].id;
            chatState = chatRows[0].chatState;
        }
        else {
            const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, currentChatId)).limit(1);
            if (chatRows.length > 0) {
                chatState = chatRows[0].chatState;
            }
        }
        // Save user message to DB
        await db.insert(messagesTable).values({
            chatId: currentChatId,
            role: 'user',
            content: prompt,
        });
        // Fetch the latest parsed resume
        const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, dbUserId)).orderBy(desc(resumesTable.createdAt)).limit(1);
        let resumeContext = 'No resume uploaded yet.';
        if (resumes.length > 0 && resumes[0]?.parsedData) {
            resumeContext = JSON.stringify(resumes[0].parsedData);
        }
        // Load recent chat history
        const historyRows = await db.select()
            .from(messagesTable)
            .where(eq(messagesTable.chatId, currentChatId))
            .orderBy(desc(messagesTable.createdAt))
            .limit(20);
        const historyMessages = historyRows.reverse().map(msg => ({
            role: msg.role,
            content: [{ type: 'text', text: msg.content || '' }]
        }));
        // Inject Context into SYSTEM PROMPT
        const contextInjectedPrompt = `${SYSTEM_PROMPT}\n\n=== USER CONTEXT ===\n- User Name: ${user.name}\n- Clerk ID (pass this to tools): ${clerkId}\n- Latest Resume Data: ${resumeContext}\n- Current Chat State: ${chatState}\n\nIf Current Chat State is COLLECTING_MISSING_INFO, you should proactively ask the user to provide missing resume details (like GitHub or LinkedIn URLs). If they provide them, ALWAYS use the updateResume tool to append the new data to their resume. If they refuse, use the updateChatState tool to change the state back to READY_FOR_CHAT.\n===================`;
        const messages = [
            { role: 'system', content: [{ type: 'text', text: contextInjectedPrompt }] },
            ...historyMessages
        ];
        const result = await askAI(messages);
        let aiText = '';
        let aiToolCalls = null;
        if (result.response?.message) {
            const msg = result.response.message;
            if (msg.content) {
                const textContent = msg.content.find(c => c.type === 'text');
                aiText = textContent ? textContent.text : '';
            }
            aiToolCalls = msg.toolCalls || null;
        }
        // MANUALLY INTERCEPT TOOL RESULTS
        // If the LLM failed to generate text after calling searchJobs, or we just want to guarantee the cards appear:
        if (result.messages) {
            for (const msg of result.messages) {
                if (msg.role === 'tool') {
                    const toolContent = msg.content?.find((c) => c.type === 'tool_result');
                    if (toolContent && toolContent.toolName === 'searchJobs' && toolContent.result) {
                        let jobsResult;
                        try {
                            jobsResult = typeof toolContent.result === 'string' ? JSON.parse(toolContent.result) : toolContent.result;
                        }
                        catch (e) {
                            jobsResult = toolContent.result;
                        }
                        const jobsList = Array.isArray(jobsResult) ? jobsResult : (jobsResult.jobs || []);
                        if (jobsList.length > 0) {
                            const jobCardsText = jobsList.map((job) => `[JOB_CARD:${job.id}]`).join('\n');
                            // Append to aiText if not already present
                            if (!aiText.includes('[JOB_CARD:')) {
                                aiText += (aiText ? '\n\n' : '') + "Here are the jobs I found for you:\n\n" + jobCardsText;
                            }
                        }
                        else if (!aiText) {
                            aiText = "I couldn't find any matching jobs right now.";
                        }
                    }
                }
            }
        }
        if (!aiText) {
            aiText = "I processed your request, but the model didn't generate a text response.";
        }
        // Save AI message to DB
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
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: fileBuffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        const extractedText = pdfData.text;
        if (!extractedText || extractedText.trim() === '') {
            throw new Error('Failed to extract text from the provided PDF.');
        }
        // 2. Use AI to extract structured JSON data
        const currentDate = new Date().toISOString().split('T')[0];
        const parsePrompt = `Extract the following structured information from the provided resume text.
Return ONLY valid JSON matching this structure exactly (no markdown formatting, no code blocks around the JSON).
Always use exactly these keys for experience and education. Do not invent new keys like 'class' or 'result'. Map them to the provided keys.
For experience, extract all the detailed bullet points, achievements, and responsibilities into the 'bulletPoints' array so NO information is lost.
Infer a few compatible job roles for the candidate based on their profile.
Pay very close attention to extracting all URLs including GitHub, LinkedIn, portfolios, and project live links if they exist in the text.
The current date is ${currentDate}. Use this context to properly interpret dates. Ensure no past dates are incorrectly parsed as future dates, and correctly identify current ongoing roles.

{
  "name": "Full Name",
  "contact": {
    "email": "email or null",
    "phone": "phone or null",
    "linkedin": "linkedin url or null",
    "github": "github url or null",
    "portfolio": "portfolio url or null"
  },
  "location": {
    "city": "City Name or null",
    "district": "District Name or null",
    "state": "State Name or null",
    "country": "Country Name or null"
  },
  "skills": ["skill1", "skill2"],
  "compatibleJobRoles": ["Role 1", "Role 2", "Role 3"],
  "experience": [{"company": "Name", "role": "Title", "duration": "Dates", "bulletPoints": ["point 1", "point 2"]}],
  "education": [{"institution": "Name", "degree": "Title"}],
  "projects": [{"name": "Project Name", "description": "Brief description", "technologies": ["tech1", "tech2"], "link": "url or null"}]
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
        // Auto-analyze
        let analysisData = null;
        try {
            analysisData = await AIService.analyzeResume(resumeRows[0].id, clerkId);
        }
        catch (e) {
            console.error("Auto-analysis failed", e);
        }
        // Replace [RESUME_UPLOAD_INPUT] with [UPLOAD_SUCCESS("filename.ext")] in the latest chat
        try {
            const latestChats = await db.select().from(chatsTable)
                .where(eq(chatsTable.userId, dbUserId))
                .orderBy(desc(chatsTable.updatedAt))
                .limit(1);
            if (latestChats.length > 0) {
                const latestChat = latestChats[0];
                const messages = await db.select().from(messagesTable)
                    .where(eq(messagesTable.chatId, latestChat.id))
                    .orderBy(desc(messagesTable.createdAt));
                const targetMessage = messages.find((m) => m.content && m.content.includes('[RESUME_UPLOAD_INPUT]'));
                if (targetMessage && targetMessage.content) {
                    await db.update(messagesTable)
                        .set({ content: targetMessage.content.replace('[RESUME_UPLOAD_INPUT]', `[UPLOAD_SUCCESS("${originalFileName}")]`) })
                        .where(eq(messagesTable.id, targetMessage.id));
                }
            }
        }
        catch (e) {
            console.error("Failed to update message template", e);
        }
        return {
            resumeId: resumeRows[0].id,
            parsedData: parsedData,
            analysis: analysisData
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
Provide a professional summary, an ATS score out of 100, and a highly detailed, personalized feedback array. 
Your feedback should point out specific missing areas, weak bullet points, or sections that need improvement. Provide actionable advice for the user to improve this specific resume.
Return ONLY valid JSON matching this structure exactly (no markdown formatting, no code blocks):
{
  "atsScore": 85,
  "summary": "A concise professional summary of the candidate...",
  "feedback": [
    {
      "title": "Actionable Title (e.g. Add Quantifiable Metrics)",
      "description": "Detailed explanation of what is wrong and how to fix it..."
    }
  ]
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
            feedback: analysisResult.feedback,
        })
            .where(eq(resumesTable.id, resumeId));
        return analysisResult;
    }
    static async getResumes(clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, dbUserId)).orderBy(desc(resumesTable.createdAt));
        return resumes;
    }
    static async getResumeById(id, clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        const resumeRows = await db.select().from(resumesTable).where(eq(resumesTable.id, id)).limit(1);
        const resume = resumeRows[0];
        if (!resume || resume.userId !== dbUserId) {
            throw new Error('Resume not found or unauthorized');
        }
        return resume;
    }
    static async deleteResume(id, clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        const resumeRows = await db.select().from(resumesTable).where(eq(resumesTable.id, id)).limit(1);
        const resume = resumeRows[0];
        if (!resume || resume.userId !== dbUserId) {
            throw new Error('Resume not found or unauthorized');
        }
        await db.delete(resumesTable).where(eq(resumesTable.id, id));
        return true;
    }
    static async getRecommendations(clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        const record = await db.select().from(projectRecommendationsTable).where(eq(projectRecommendationsTable.userId, dbUserId)).limit(1);
        return record[0] || null;
    }
    static async recommendProjects(clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        // Check if record exists
        const existingRows = await db.select().from(projectRecommendationsTable).where(eq(projectRecommendationsTable.userId, dbUserId)).limit(1);
        if (existingRows.length) {
            await db.update(projectRecommendationsTable).set({ isGenerating: true }).where(eq(projectRecommendationsTable.id, existingRows[0].id));
        }
        else {
            await db.insert(projectRecommendationsTable).values({ userId: dbUserId, isGenerating: true });
        }
        // Start background generation
        (async () => {
            try {
                const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, dbUserId));
                const allSkills = new Set();
                const allJobRoles = new Set();
                const existingProjects = [];
                resumes.forEach(resume => {
                    if (resume.parsedData) {
                        const pd = resume.parsedData;
                        if (pd.skills) {
                            const skillsArray = Array.isArray(pd.skills) ? pd.skills : (typeof pd.skills === 'string' ? pd.skills.split(',') : []);
                            skillsArray.forEach((s) => allSkills.add(s.trim()));
                        }
                        if (pd.compatibleJobRoles) {
                            const rolesArray = Array.isArray(pd.compatibleJobRoles) ? pd.compatibleJobRoles : (typeof pd.compatibleJobRoles === 'string' ? pd.compatibleJobRoles.split(',') : []);
                            rolesArray.forEach((r) => allJobRoles.add(r.trim()));
                        }
                        if (pd.projects && Array.isArray(pd.projects)) {
                            pd.projects.forEach((p) => existingProjects.push(p));
                        }
                    }
                });
                const prompt = `You are an expert technical career advisor.
Based on the candidate's existing skills, compatible job roles, and existing projects, recommend 4 to 6 new projects of varying difficulty (ensure there is at least one "Beginner" project, and at least one "Intermediate" project) that will help the candidate grow in their career, build upon their current skills, and land better job opportunities.

IMPORTANT: DO NOT recommend any projects that are similar to their existing projects.
IMPORTANT: Output ONLY valid JSON containing an array of recommended projects matching this structure exactly (no markdown formatting, no code blocks):
{
  "recommendations": [
    {
      "title": "Project Name",
      "description": "Detailed description of what to build and why it's impressive.",
      "technologies": ["Tech 1", "Tech 2"],
      "difficulty": "Beginner | Intermediate | Advanced",
      "reasonToBuild": "Why this helps land a better job."
    }
  ]
}

Candidate's Current Skills: ${Array.from(allSkills).join(", ") || "None listed"}
Candidate's Target Roles: ${Array.from(allJobRoles).join(", ") || "None listed"}
Candidate's Existing Projects (DO NOT RECOMMEND THESE):
${JSON.stringify(existingProjects)}
`;
                const extractionMessages = [
                    { role: 'system', content: [{ type: 'text', text: 'You are an expert AI career advisor. You only output pure JSON without any surrounding text or markdown blocks.' }] },
                    { role: 'user', content: [{ type: 'text', text: prompt }] }
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
                let recommendationResult = JSON.parse(aiText);
                await db.update(projectRecommendationsTable)
                    .set({ recommendations: recommendationResult.recommendations || [], isGenerating: false })
                    .where(eq(projectRecommendationsTable.userId, dbUserId));
            }
            catch (error) {
                console.error("Background recommendation generation failed:", error);
                await db.update(projectRecommendationsTable)
                    .set({ isGenerating: false })
                    .where(eq(projectRecommendationsTable.userId, dbUserId));
            }
        })();
        return true;
    }
    static async getLatestChat(clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length)
            return null;
        const dbUserId = userRows[0].id;
        const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.userId, dbUserId)).orderBy(desc(chatsTable.createdAt)).limit(1);
        if (!chatRows.length)
            return null;
        const chat = chatRows[0];
        const historyRows = await db.select()
            .from(messagesTable)
            .where(eq(messagesTable.chatId, chat.id))
            .orderBy(messagesTable.createdAt);
        return { chat, messages: historyRows };
    }
    static async getChatsList(clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length)
            return [];
        const dbUserId = userRows[0].id;
        return await db.select()
            .from(chatsTable)
            .where(eq(chatsTable.userId, dbUserId))
            .orderBy(desc(chatsTable.updatedAt));
    }
    static async getChatById(chatId, clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length)
            return null;
        const dbUserId = userRows[0].id;
        const chatRows = await db.select()
            .from(chatsTable)
            .where(eq(chatsTable.id, chatId))
            .limit(1);
        if (!chatRows.length || chatRows[0].userId !== dbUserId)
            return null;
        const chat = chatRows[0];
        const historyRows = await db.select()
            .from(messagesTable)
            .where(eq(messagesTable.chatId, chat.id))
            .orderBy(messagesTable.createdAt);
        return { chat, messages: historyRows };
    }
    static async deleteChat(chatId, clerkId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length)
            throw new Error('User not found');
        const dbUserId = userRows[0].id;
        const chatRows = await db.select()
            .from(chatsTable)
            .where(eq(chatsTable.id, chatId))
            .limit(1);
        if (!chatRows.length || chatRows[0].userId !== dbUserId) {
            throw new Error('Chat not found or unauthorized');
        }
        await db.delete(chatsTable).where(eq(chatsTable.id, chatId));
        return true;
    }
    static async updateChatState(chatId, clerkId, state) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length)
            throw new Error('User not found');
        const dbUserId = userRows[0].id;
        const chatRows = await db.select()
            .from(chatsTable)
            .where(eq(chatsTable.id, chatId))
            .limit(1);
        if (!chatRows.length || chatRows[0].userId !== dbUserId) {
            throw new Error('Chat not found or unauthorized');
        }
        await db.update(chatsTable).set({ chatState: state }).where(eq(chatsTable.id, chatId));
        return true;
    }
}
//# sourceMappingURL=ai.service.js.map