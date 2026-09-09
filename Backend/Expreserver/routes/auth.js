import express from 'express';
import { loginUser, registerUser, getProfile, refreshAccessToken, logoutUser } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// Route to refresh the access token using a refresh token
router.post('/refresh', refreshAccessToken);
router.post('/logout', authMiddleware, logoutUser);
router.get('/profile', authMiddleware, getProfile);

export default router;
