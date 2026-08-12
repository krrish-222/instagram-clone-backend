const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth.controller');

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logout);
authRouter.post('/logout-all', authController.logoutAll);
// authRouter.post("/verify-email", authController.verifyEmail);

module.exports = authRouter;