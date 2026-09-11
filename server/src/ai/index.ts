import { Agent, OpenAICompatibleProvider, AgentEventBus, type Message } from 'agenix';
import dotenv from 'dotenv';
import { analyzeResumeTool, analyzeResumeSchema, updateResumeTool, updateResumeSchema, updateChatStateTool, updateChatStateSchema } from './tools/resumeTools.js';
import { searchJobsTool, searchJobsSchema } from './tools/jobSpyTool.js';
import { recommendProjectsTool, recommendProjectsSchema } from './tools/projectTool.js';

dotenv.config();

// --- General System (ATS, Recommendations, etc.) ---
// Primary
const primaryAiProvider = new OpenAICompatibleProvider({
  apiKey: process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? 'local-key',
  baseURL: process.env.AI_API_URL ?? "https://api.openai.com/api/v1",
});

// Fallback
const fallbackAiProvider = new OpenAICompatibleProvider({
  apiKey: process.env.FALLBACK_AI_API_KEY ?? 'fallback-key',
  baseURL: process.env.FALLBACK_AI_API_URL ?? "https://api.openai.com/api/v1",
});

// --- Chat Mode (OpenRouter / Custom) ---
// Primary
const primaryChatProvider = new OpenAICompatibleProvider({
  baseURL: process.env.CHAT_LLM_API_BASE_URL as string,
  apiKey: process.env.CHAT_LLM_API_KEY as string,
});

// Fallback
const fallbackChatProvider = new OpenAICompatibleProvider({
  baseURL: process.env.FALLBACK_CHAT_LLM_API_BASE_URL as string,
  apiKey: process.env.FALLBACK_CHAT_LLM_API_KEY as string,
});

export const aiEvents = new AgentEventBus();

// General System Agents Array
export const aiGateways = [
  new Agent({
    provider: primaryAiProvider,
    model: process.env.AI_MODEL_NAME ?? 'openai/gpt-4o-mini',
    events: aiEvents,
    loggerEnabled: true,
    preferStreaming: false,
  }),
  new Agent({
    provider: fallbackAiProvider,
    model: process.env.FALLBACK_AI_MODEL_NAME ?? 'openai/gpt-4o',
    events: aiEvents,
    loggerEnabled: true,
    preferStreaming: false,
  })
];

// Keep aiGateway exported for backwards compatibility with anything else referencing it, using primary
export const aiGateway = aiGateways[0]; 

// Chat System Agents Array
export const chatGateways = [
  new Agent({
    provider: primaryChatProvider,
    model: process.env.CHAT_MODEL_NAME ?? 'openrouter/auto',
    events: aiEvents,
    loggerEnabled: true,
    preferStreaming: false,
  }),
  new Agent({
    provider: fallbackChatProvider,
    model: process.env.FALLBACK_CHAT_MODEL_NAME ?? 'openai/gpt-4o-mini',
    events: aiEvents,
    loggerEnabled: true,
    preferStreaming: false,
  })
];

// Register tools on all general gateways
for (const gateway of aiGateways) {
  gateway.getEngine().getToolRegistry().register(analyzeResumeTool, analyzeResumeSchema);
}

// Register tools on all chat gateways
for (const gateway of chatGateways) {
  gateway.getEngine().getToolRegistry().register(analyzeResumeTool, analyzeResumeSchema);
  gateway.getEngine().getToolRegistry().register(searchJobsTool, searchJobsSchema);
  gateway.getEngine().getToolRegistry().register(recommendProjectsTool, recommendProjectsSchema);
  gateway.getEngine().getToolRegistry().register(updateResumeTool, updateResumeSchema);
  gateway.getEngine().getToolRegistry().register(updateChatStateTool, updateChatStateSchema);
}

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

/**
 * Executes a list of AI agents in order. If one fails, it catches the error and tries the next one.
 */
async function executeWithFallback(gateways: Agent[], messages: Message[]) {
  let lastError: Error | null = null;

  console.info(`\n========== AI REQUEST ==========`);
  console.info(JSON.stringify(messages, null, 2));
  console.info(`================================`);

  for (let i = 0; i < gateways.length; i++) {
    try {
      if (i > 0) {
        console.info(`[AI Fallback] Retrying request with fallback configuration (Attempt ${i + 1})`);
      }
      const gateway = gateways[i]!;
      const result = await gateway.run(messages);
      
      console.info(`\n========== AI RESPONSE (Gateway ${i}) ==========`);
      console.info(JSON.stringify(result, null, 2));
      console.info(`=================================================`);

      return result;
    } catch (error: any) {
      console.error(`[AI Error] Gateway at index ${i} failed:`, error?.message || error);
      lastError = error;
    }
  }
  console.error('[AI Fatal Error] All fallback gateways failed.');
  throw lastError || new Error('All AI gateways failed.');
}

export async function askAI(messages: Message[]) {
  return await executeWithFallback(chatGateways, messages);
}

export async function runAIGateway(messages: Message[]) {
  return await executeWithFallback(aiGateways, messages);
}
