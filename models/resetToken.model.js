const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const resetTokenSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    resetTokenHash:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true,
        expires:0
    },
    used:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model("ResetToken",resetTokenSchema);