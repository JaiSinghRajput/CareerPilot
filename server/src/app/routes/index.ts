import express, { type Router } from 'express';
import AIRoutes from '../modules/ai/ai.route.js';
import BuilderRoutes from '../modules/builder/builder.route.js';
import JobsRoutes from '../modules/jobs/jobs.route.js';

const router: Router = express.Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [
  {
    path: '/ai',
    route: AIRoutes,
  },
  {
    path: '/builder',
    route: BuilderRoutes,
  },
  {
    path: '/jobs',
    route: JobsRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
