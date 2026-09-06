import express, { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { JobsController } from './jobs.controller.js';
const router = express.Router();
router.get('/', requireAuth, JobsController.getMatchingJobs);
router.get('/:id', requireAuth, JobsController.getJobById);
export default router;
//# sourceMappingURL=jobs.route.js.map