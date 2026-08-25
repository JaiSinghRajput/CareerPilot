import express, { type Router } from 'express';
import AIRoutes from '../modules/ai/ai.route.js';

const router: Router = express.Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [
  {
    path: '/ai',
    route: AIRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
