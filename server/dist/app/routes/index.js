import express, {} from 'express';
import AIRoutes from '../modules/ai/ai.route.js';
import BuilderRoutes from '../modules/builder/builder.route.js';
import JobsRoutes from '../modules/jobs/jobs.route.js';
const router = express.Router();
const moduleRoutes = [
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
//# sourceMappingURL=index.js.map