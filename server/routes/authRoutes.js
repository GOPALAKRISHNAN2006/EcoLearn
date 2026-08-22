import express from 'express';
import { refreshSession, logoutSession } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/refresh', refreshSession);
authRouter.post('/logout', logoutSession);

export default authRouter;
