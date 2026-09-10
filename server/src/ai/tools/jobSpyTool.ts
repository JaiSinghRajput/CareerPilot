import type { Tool, JsonObject } from 'agenix';
import { JobsService } from '../../app/modules/jobs/jobs.service.js';

interface SearchJobsInput extends JsonObject {
  clerkId: string;
  searchTerm?: string;
  location?: string;
  isRemote?: boolean;
}

export const searchJobsTool: Tool<SearchJobsInput, string> = {
  name: 'searchJobs',
  description: 'Searches for job listings based on the user\'s clerkId (from system context). You can provide an optional search term (e.g., "Software Engineer") and an optional location. The AI must ALWAYS provide the clerkId. IMPORTANT: If the user specifically asks for remote jobs or opportunities, you MUST set the `isRemote` boolean to `true` instead of passing "remote" as a location string.',
  execute: async (input) => {
    try {
      if (!input.clerkId) {
        return JSON.stringify({ error: 'clerkId is required to fetch personalized jobs.' });
      }

      const jobs = await JobsService.autoLoadMatchingJobs(
        input.clerkId,
        input.searchTerm ? [input.searchTerm] : undefined,
        input.location || undefined,
        0, // offset
        input.isRemote
      );

      const jobsList = Array.isArray(jobs) ? jobs : (jobs.jobs || []);

      const minimalJobs = jobsList.slice(0, 3).map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company || job.company_name,
        location: job.location,
        salary: job.salary_source || job.salary,
        // Provide a small snippet to save tokens, the full DB object retains the rest
        description_snippet: job.description ? job.description.substring(0, 300) + '...' : ''
      }));

      return JSON.stringify({
        success: true,
        count: jobsList.length,
        jobs: minimalJobs
      });
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch jobs: ${e.message}` });
    }
  }
};

export const searchJobsSchema = {
  type: 'object',
  properties: {
    clerkId: {
      type: 'string',
      description: 'The clerk ID of the user, provided in the system context.',
    },
    searchTerm: {
      type: 'string',
      description: 'Optional. The job title or keyword to search for.',
    },
    location: {
      type: 'string',
      description: 'Optional. The location to search in.',
    },
    isRemote: {
      type: 'boolean',
      description: 'Optional. Set to true if the user is explicitly looking for remote jobs.',
    }
  },
  required: ['clerkId']
};
