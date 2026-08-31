import { Agent, OpenAICompatibleProvider, AgentEventBus } from 'agenix';
import dotenv from 'dotenv';
import { analyzeResumeTool, analyzeResumeSchema } from './tools/resumeTools.js';
dotenv.config();
// Using OpenAICompatibleProvider configured for Eden AI
const aiProvider = new OpenAICompatibleProvider({
    apiKey: process.env.EDEN_API_KEY ?? process.env.OPENAI_API_KEY ?? 'local-key',
    baseURL: 'https://api.edenai.run/v3',
});
export const aiEvents = new AgentEventBus();
// Basic Gateway Agent Initialization
export const aiGateway = new Agent({
    provider: aiProvider,
    model: process.env.EDEN_MODEL_NAME ?? 'google/lyria-3-clip-preview', // Eden AI requires provider/model format
    events: aiEvents,
    loggerEnabled: true,
    preferStreaming: false, // Eden AI payload had stream: false, updating to match
});
// Register tools
aiGateway.getEngine().getToolRegistry().register(analyzeResumeTool, analyzeResumeSchema);
const SYSTEM_PROMPT = `You are CareerPilot, an expert AI career counselor and ATS resume analyzer. 
Your goal is to help users improve their resumes, prepare for interviews, and find jobs. 
Be concise, professional, and actionable in your advice.

Formatting Rules:
- Use Markdown for lists, tables, and styling.
- Use \`\`\`code fences\`\`\` for all code blocks.
- Format file names, paths, and function names with \`inline code\` backticks.
- **For all mathematical expressions, you must use dollar-sign delimiters. Use $...$ for inline math and $$...$$ for block math. Do not use (...) or [...] delimiters.**`;
export async function askAI(prompt) {
    try {
        const messages = [
            { role: 'system', content: [{ type: 'text', text: SYSTEM_PROMPT }] },
            { role: 'user', content: [{ type: 'text', text: prompt }] }
        ];
        const result = await aiGateway.run(messages);
        return result;
    }
    catch (error) {
        console.error('AI Gateway Error:', error);
        throw error;
    }
}
//# sourceMappingURL=index.js.map