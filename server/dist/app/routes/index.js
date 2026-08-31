import express, {} from 'express';
import AIRoutes from '../modules/ai/ai.route.js';
const router = express.Router();
const moduleRoutes = [
    {
        path: '/ai',
        route: AIRoutes,
    }
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
//# sourceMappingURL=index.js.map