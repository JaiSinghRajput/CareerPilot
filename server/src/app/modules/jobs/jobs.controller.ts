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

      const { searchTerm, location } = req.query;

      const jobsData = await JobsService.autoLoadMatchingJobs(
        clerkId, 
        searchTerm as string | undefined, 
        location as string | undefined
      );
      res.status(200).json({ success: true, data: jobsData });
    } catch (error: any) {
      console.error('Error in getMatchingJobs:', error);
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
