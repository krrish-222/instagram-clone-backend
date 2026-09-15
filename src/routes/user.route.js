const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../config/multer.config");

const userRouter = express.Router();

userRouter.get("/me",authMiddleware, userController.getMyProfile);
userRouter.get("/:username", userController.getByUsername);
userRouter.post("/me/edit",authMiddleware, userController.editMyProfile)
userRouter.post("/me/edit/picture",authMiddleware, upload.single("profilePicture"), userController.editProfilePicture)
userRouter.get(":username/posts",userController.getUserPosts);
userRouter.get(":username/followers",userController.getFollowers);
userRouter.get(":username/followings",userController.getFollowings);


// Error handling middleware for multer
userRouter.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = userRouter;