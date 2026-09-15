const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true,
        expires:0
    }
},{
    timestamps:true,
});

otpSchema.pre('save', function() {
    const otpHash = bcrypt.hashSync(this.otp, 10);
    this.otp = otpHash;
});

module.exports = mongoose.model("Otp",otpSchema);