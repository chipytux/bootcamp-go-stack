import { Router } from 'express';
import UserController from './app/controllers/userController';
import SessionController from './app/controllers/sessionController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.get('/users', UserController.show);
routes.put('/users', authMiddleware, UserController.update);


routes.post('/sessions', SessionController.store);

export default routes;
