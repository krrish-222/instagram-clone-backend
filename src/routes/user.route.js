const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");


const userRouter = express.Router();

userRouter.get("/me",authMiddleware, userController.getMyProfile);


module.exports = userRouter;