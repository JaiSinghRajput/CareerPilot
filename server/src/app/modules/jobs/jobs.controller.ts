import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { JobsService } from './jobs.service.js';

export class JobsController {
  public static async getMatchingJobs(req: Request, res: Response): Promise<void> {
    try {
      const { userId: clerkId } = getAuth(req);
      
      if (!clerkId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { searchTerms, location, offset, isRemote } = req.query;

      let parsedSearchTerms: string[] | undefined = undefined;
      if (searchTerms) {
        if (Array.isArray(searchTerms)) {
          parsedSearchTerms = searchTerms as string[];
        } else if (typeof searchTerms === 'string') {
          parsedSearchTerms = [searchTerms];
        }
      }

      const jobsData = await JobsService.autoLoadMatchingJobs(
        clerkId, 
        parsedSearchTerms, 
        location as string | undefined,
        offset ? parseInt(offset as string) : 0,
        isRemote === 'true' || isRemote === '1' ? true : (isRemote === 'false' || isRemote === '0' ? false : undefined)
      );
      res.status(200).json({ success: true, data: jobsData });
    } catch (error: any) {
      console.error('Error getting matching jobs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getJobTitleSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        res.status(400).json({ success: false, error: 'Query parameter q is required' });
        return;
      }
      
      const titles = await JobsService.suggestJobTitles(q);
      res.status(200).json({ success: true, data: titles });
    } catch (error: any) {
      console.error('Error getting job title suggestions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const { userId: clerkId } = getAuth(req);
      const { id } = req.params;
      
      if (!clerkId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      if (!id) {
        res.status(400).json({ success: false, error: 'Job ID is required' });
        return;
      }

      const job = await JobsService.getJobById(clerkId, id as string);
      res.status(200).json({ success: true, data: job });
    } catch (error: any) {
      console.error('Error in getJobById:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
