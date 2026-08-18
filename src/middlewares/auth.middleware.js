const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authMiddleware = async (req,res,next)=>{
    // const authHeader = req.headers.authorization;
    // if(!authHeader?.startsWith('Bearer ')){
    //     return res.status(401).json({message:"Unauthorized"});
    // }
    // const accessToken = authHeader.split(" ")[1];

    const accessToken = req.body.accessToken; //get

    const decoded = await jwt.verify(accessToken,process.env.JWT_SECRET);

    if(!decoded){
        return res.status(401).json({message:"Invalid token"});
    }

    req.user = await User.findById(decoded.userId);

    if(!req.user){
        return res.status(401).json({message:"User not found"});
    }
    next();
}

module.exports = authMiddleware;
       