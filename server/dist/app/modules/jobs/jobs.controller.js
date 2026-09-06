import { getAuth } from '@clerk/express';
import { JobsService } from './jobs.service.js';
export class JobsController {
    static async getMatchingJobs(req, res) {
        try {
            const { userId: clerkId } = getAuth(req);
            if (!clerkId) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return;
            }
            const { searchTerm, location } = req.query;
            const jobsData = await JobsService.autoLoadMatchingJobs(clerkId, searchTerm, location);
            res.status(200).json({ success: true, data: jobsData });
        }
        catch (error) {
            console.error('Error in getMatchingJobs:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
    static async getJobById(req, res) {
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
            const job = await JobsService.getJobById(clerkId, id);
            res.status(200).json({ success: true, data: job });
        }
        catch (error) {
            console.error('Error in getJobById:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
//# sourceMappingURL=jobs.controller.js.map