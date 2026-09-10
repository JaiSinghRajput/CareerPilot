import { Agent, OpenAICompatibleProvider, GeminiCompatibleProvider, AgentEventBus } from 'agenix';
import dotenv from 'dotenv';
import { analyzeResumeTool, analyzeResumeSchema, updateResumeTool, updateResumeSchema, updateChatStateTool, updateChatStateSchema } from './tools/resumeTools.js';
import { searchJobsTool, searchJobsSchema } from './tools/jobSpyTool.js';
import { recommendProjectsTool, recommendProjectsSchema } from './tools/projectTool.js';
dotenv.config();
// Existing Provider for General System (ATS, Recommendations, etc.)
const aiProvider = new OpenAICompatibleProvider({
    apiKey: process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? 'local-key',
    baseURL: process.env.AI_API_URL ?? "https://api.openai.com/api/v1",
});
// Dedicated Provider for Chat Mode (OpenRouter / Custom)
const chatProvider = new OpenAICompatibleProvider({
    baseURL: process.env.CHAT_LLM_API_BASE_URL,
    apiKey: process.env.CHAT_LLM_API_KEY,
});
export const aiEvents = new AgentEventBus();
// Basic Gateway Agent Initialization (General System)
export const aiGateway = new Agent({
    provider: aiProvider,
    model: process.env.EDEN_MODEL_NAME ?? 'openai/gpt-4o-mini',
    events: aiEvents,
    loggerEnabled: true,
    preferStreaming: false,
});
// Chat Gateway Agent Initialization (Custom Chat Model)
export const chatGateway = new Agent({
    provider: chatProvider,
    model: process.env.CHAT_MODEL_NAME ?? 'openrouter/auto',
    events: aiEvents,
    loggerEnabled: true,
    preferStreaming: false,
});
// Register tools on general gateway
aiGateway.getEngine().getToolRegistry().register(analyzeResumeTool, analyzeResumeSchema);
// Register tools on chat gateway
chatGateway.getEngine().getToolRegistry().register(analyzeResumeTool, analyzeResumeSchema);
chatGateway.getEngine().getToolRegistry().register(searchJobsTool, searchJobsSchema);
chatGateway.getEngine().getToolRegistry().register(recommendProjectsTool, recommendProjectsSchema);
chatGateway.getEngine().getToolRegistry().register(updateResumeTool, updateResumeSchema);
chatGateway.getEngine().getToolRegistry().register(updateChatStateTool, updateChatStateSchema);
export const SYSTEM_PROMPT = `You are a helpful, advanced AI assistant integrated directly into the CareerPilot application.
Your goal is to help users improve their resumes, prepare for interviews, suggest projects, and find jobs.
Be concise, professional, and actionable in your advice.

IMPORTANT TOOL INSTRUCTIONS:
- You have been provided with the user's Context (Name, Clerk ID, and Resume Data) via a system message.
- You have access to tools that can fetch live job listings (\`searchJobs\`) and recommend projects (\`recommendProjects\`).
- If a user asks for jobs or projects, DO NOT make them up. ALWAYS use your tools to fetch them from the database.
- When calling \`searchJobs\` or \`recommendProjects\`, you MUST pass the user's Clerk ID exactly as provided in the Context.

RESUME UPLOAD INSTRUCTIONS:
- If the user asks you to analyze or review their resume, first check the Latest Resume Data in the user context.
- If it says "No resume uploaded yet.", you MUST reply by asking them to upload their resume and you MUST include the exact tag \`[RESUME_UPLOAD_INPUT]\` on a new line. Do NOT try to analyze anything if they haven't uploaded it.
- When the user uploads their resume, they will send a message confirming it. After that, the context will contain their resume data, and you should provide a summary and actionable feedback on it.

JOB RENDERING INSTRUCTIONS:
- When you receive job results from the \`searchJobs\` tool, DO NOT write out the job title, company, or details yourself.
- Instead, you MUST output a special tag for EACH job in this exact format: \`[JOB_CARD:job_id]\` where \`job_id\` is the exact ID of the job from the tool result.
- For example, if the tool returns a job with id "12345", you should just output \`[JOB_CARD:12345]\` on a new line. The frontend UI will automatically intercept this tag and render a beautiful job card for the user. Do not try to describe the job yourself.

Formatting guidelines:
- Use standard markdown formatting.
- Format file names, paths, and function names with \`inline code\` backticks.
- **For all mathematical expressions, you must use dollar-sign delimiters. Use $...$ for inline math and $$...$$ for block math. Do not use (...) or [...] delimiters.**`;
export async function askAI(messages) {
    try {
        const result = await chatGateway.run(messages);
        return result;
    }
    catch (error) {
        console.error('Error in askAI:', error);
        throw error;
    }
}
//# sourceMappingURL=index.js.map