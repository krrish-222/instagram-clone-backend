const User = require("../models/user.model");
const {uploadProfilePicture,deleteImageByUrl} = require("../services/storage.service");

exports.getMyProfile = (req,res)=>{

    if(!req.user){
        return res.status(401).json({message:"Unauthorized"});
    }
    res.status(200).json({message:"my user profile",user:req.user});
};

exports.getByUsername = async (req,res)=>{
    let {username} = req.params;
    username = username.toLowerCase();
    try{
        const user = await User.findOne({username}).select("-password -email -dateOfBirth");

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        if(req.user?.username === user.username){
            return res.status(200).json({message:"my user profile",user:req.user});
        }
        return res.status(200).json({message:"User found successfully",user});
    }
    catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
    
};

exports.editMyProfile = async (req,res)=>{
    if(!req.user){
        return res.status(400).json({message:"Unauthorized"});
    }
    let {username,name,bio,gender,dateOfBirth} = req.body;
    if (username) username = username.toLowerCase();
    if (gender) gender = gender.toLowerCase();



    // Validate input
    body('username')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .run(req);  
    

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        if(username && username != req.user.username){
            const user = await User.findOne({username});
            if(user){
                return res.status(400).json({message:"Username already exists"});
            }
            req.user.username = username;
        }
        if(name) req.user.name = name;
        if(bio) req.user.bio = bio;
        if(gender) req.user.gender = gender;
        if(dateOfBirth) req.user.dateOfBirth = dateOfBirth;
        try{
            await req.user.save();
        }catch(err){
            return res.status(400).json({message:"Invalid details provided"});
        }
        return res.status(200).json({message:"User updated successfully",user:req.user});

    }
    catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
}

exports.editProfilePicture = async (req,res)=>{
    if(!req.file){
        return res.status(400).json({message:"No file uploaded"});
    }
    try{
      
        const response = await uploadProfilePicture(req.file.buffer);
        const oldProfilePicture = req.user.profilePicture;
        req.user.profilePicture = response.url;
        await req.user.save();
        
        res.status(200).json({message:"Profile picture updated successfully",profilePicture:response.url});
        
        try{
            if(oldProfilePicture){
                await deleteImageByUrl(oldProfilePicture);
            }
            console.log("Old profile picture deleted successfully");

        }catch(err){
            console.log("Error in deleting old profile picture", err);
        }
    }
    catch(err){
        console.log("error is :",err)
        return res.status(500).json({message:"Internal server error"});
    }

}

exports.getUserPosts = async (req,res)=>{
    try {
        const username = req.params.username;
        const user = await User.findOne({ username }).select("posts");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        

        const posts = await user.populate("posts").posts;
        return res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getFollowers = async (req,res)=>{
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        

        const followers = await user.populate("followers").followers;
        return res.status(200).json({ message: "Followers fetched successfully", followers });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getFollowings = async (req,res)=>{
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const following = await user.populate("following").following;
        return res.status(200).json({ message: "followings fetched successfully", following });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}