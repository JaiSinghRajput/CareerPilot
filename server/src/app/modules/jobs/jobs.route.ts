import express, { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { JobsController } from './jobs.controller.js';

const router: Router = express.Router();

router.get('/', requireAuth, JobsController.getMatchingJobs);
router.get('/titles/suggest', requireAuth, JobsController.getJobTitleSuggestions);
router.get('/:id', requireAuth, JobsController.getJobById);

export default router;
