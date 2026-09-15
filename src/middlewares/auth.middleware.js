const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Session = require("../models/session.model");

const authMiddleware = async (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader?.startsWith('Bearer ')){
        return res.status(401).json({message:"Unauthorized"});
    }
    const accessToken = authHeader.split(" ")[1];

    const decoded = await jwt.verify(accessToken,process.env.JWT_SECRET);
    const session = await Session.findById(decoded.sessionId);
    if(!decoded || !session || session.revoked){
        if(session.revoked) Session.delete({userId:decoded.userId});
        return res.status(401).json({message:"Invalid token"});
    }
    
    req.user = await User.findById(decoded.userId);

    if(!req.user){
        return res.status(401).json({message:"User not found"});
    }
    next();
}

module.exports = authMiddleware;
       