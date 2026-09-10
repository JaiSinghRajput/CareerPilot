import type { Tool, JsonObject } from 'agenix';
import db from '../../db/db.js';
import { usersTable, resumesTable, chatsTable } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

interface AnalyzeResumeInput extends JsonObject {
  parsedData: string;
}

export const analyzeResumeTool: Tool<AnalyzeResumeInput, string> = {
  name: 'analyzeResume',
  description: 'Analyzes a parsed resume (JSON string) against an optional job description to provide ATS score and keyword feedback.',
  execute: async (input) => {
    try {
      const resume = JSON.parse(input.parsedData);
      
      // Basic rule-based ATS evaluation
      let score = 50; // Base score
      const feedback = [];
      const foundSkills = resume.skills || [];

      if (foundSkills.length > 5) {
        score += 20;
        feedback.push("Good amount of skills listed.");
      } else {
        feedback.push("Add more technical or soft skills to improve visibility.");
      }

      if (resume.experience && resume.experience.length > 0) {
        score += 20;
        feedback.push("Experience section is populated.");
      } else {
        feedback.push("Experience section is missing or empty.");
        score -= 10;
      }

      if (resume.summary && resume.summary.length > 50) {
        score += 10;
      } else {
        feedback.push("Consider adding a more detailed professional summary.");
      }
      
      // Clamp score
      score = Math.max(0, Math.min(100, score));

      return JSON.stringify({
        atsScore: score,
        status: score > 75 ? 'Excellent' : score > 50 ? 'Good' : 'Needs Work',
        feedback: feedback,
      });
    } catch (e) {
      return JSON.stringify({ error: 'Failed to parse or analyze resume data. Please ensure it is valid JSON.' });
    }
  }
};

export const analyzeResumeSchema = {
  type: 'object',
  properties: {
    parsedData: {
      type: 'string',
      description: 'The JSON string of the parsed resume to analyze',
    }
  },
  required: ['parsedData'],
};

interface UpdateResumeInput extends JsonObject {
  clerkId: string;
  updatedResumeData: string;
}

export const updateResumeTool: Tool<UpdateResumeInput, string> = {
  name: 'updateResume',
  description: 'Update the user\'s resume data directly. Pass the complete updated resume JSON string and the user\'s clerkId. Only use this if the user provides new resume information. DO NOT delete existing information.',
  execute: async (input) => {
    try {
      const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, input.clerkId)).limit(1);
      if (!userRows.length) return JSON.stringify({ error: 'User not found.' });
      
      const dbUserId = userRows[0]!.id;
      const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, dbUserId)).orderBy(desc(resumesTable.createdAt)).limit(1);
      if (!resumes.length) return JSON.stringify({ error: 'No resume found for user.' });

      const updatedData = JSON.parse(input.updatedResumeData);
      
      await db.update(resumesTable)
        .set({ parsedData: updatedData })
        .where(eq(resumesTable.id, resumes[0]!.id));

      return JSON.stringify({ success: true, message: 'Resume data updated successfully in database.' });
    } catch (e) {
      return JSON.stringify({ error: 'Failed to update resume data.' });
    }
  }
};

export const updateResumeSchema = {
  type: 'object',
  properties: {
    clerkId: {
      type: 'string',
      description: 'The clerkId of the user. MUST BE EXACTLY AS PROVIDED IN THE SYSTEM PROMPT.'
    },
    updatedResumeData: {
      type: 'string',
      description: 'The complete, updated JSON string of the resume. Include all previous data plus the new changes.'
    }
  },
  required: ['clerkId', 'updatedResumeData']
};

interface UpdateChatStateInput extends JsonObject {
  chatId: number;
  newState: string;
}

export const updateChatStateTool: Tool<UpdateChatStateInput, string> = {
  name: 'updateChatState',
  description: 'Update the chat state (e.g., READY_FOR_CHAT, COLLECTING_MISSING_INFO).',
  execute: async (input) => {
    try {
      await db.update(chatsTable)
        .set({ chatState: input.newState })
        .where(eq(chatsTable.id, input.chatId));
      return JSON.stringify({ success: true, message: `Chat state updated to ${input.newState}` });
    } catch (e) {
      return JSON.stringify({ error: 'Failed to update chat state.' });
    }
  }
};

export const updateChatStateSchema = {
  type: 'object',
  properties: {
    chatId: {
      type: 'number',
      description: 'The ID of the current chat.'
    },
    newState: {
      type: 'string',
      description: 'The new state (e.g., READY_FOR_CHAT, COLLECTING_MISSING_INFO).'
    }
  },
  required: ['chatId', 'newState']
};
