const Post = require("../models/post.model");
const { uploadPost } = require("../services/storage.service");

exports.uploadPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const images = req.files;
        images = await images.map(async (image) => {
            const buffer = image.buffer;
            const response = await uploadPost(buffer);
            return response.url;
        })
        const post = new Post({ author: req.user._id, caption, images });
        await post.save();

        req.user.posts.push(post._id);
        await req.user.save();


        return res.status(200).json({ message: "Post uploaded successfully", post });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error"});
    }
}

exports.getPost = async (req, res) => {
    const postId = req.param.postId;
    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json({ message: "Post fetched successfully", post });

    }
    catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.deletePost = async (req,res)=>{
    const postId = req.params.postId;
    try{
        const post = Post.findById(postId);

        if(!post){
            return res.status(404).json({ message: "Post not found" });
        }

        const isPostMy = Post.author === req.user._id;

        if(!isPostMy){
            return res.status(404).json({ message: "Unauthorized to delete this post" });
        }

        await Post.deleteOne({_id:postId});
        return res.status(200).json({message:"Post deleted successfully"});
    }
    catch(err){
        return res.status(500).json({ message: "Internal server error" });
    }

}