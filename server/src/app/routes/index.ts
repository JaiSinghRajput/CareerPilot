import express, { type Router } from 'express';

const router: Router = express.Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [
  // {
  //   path: '/users',
  //   route: UserRoutes,
  // }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
