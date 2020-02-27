import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FilesController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.get('/users', UserController.show);
routes.put('/users', authMiddleware, UserController.update);


routes.get('/providers', authMiddleware, ProviderController.index);


routes.post('/sessions', SessionController.store);

routes.post('/files', upload.single('file'), FilesController.store);

export default routes;
