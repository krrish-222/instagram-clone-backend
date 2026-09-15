const express = require("express");
const postController = require("../controllers/post.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../config/multer.config");

const postRouter = express.Router();

postRouter.post("/", authMiddleware, upload.any("images"), postController.uploadPost);
postRouter.get("/:postId", postController.getPost);
postRouter.delete("/:postId", postController.deletePost);




module.exports = postRouter;