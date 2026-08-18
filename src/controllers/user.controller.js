const User = require("../models/user.model");

exports.getMyProfile = (req,res)=>{
    res.status(200).json({message:"my user profile",user:req.user});
};

exports.getByUsername = async (req,res)=>{
    const {username} = req.params;
    try{
        const user = await User.findOne({username});

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        return res.status(200).json({message:"User found successfully",user});
    }
    catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
    
};