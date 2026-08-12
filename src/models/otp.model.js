const mongoose = require("mongoose");

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
        required:true
    }
},{
    timestamps:true
});

otpSchema.pre('save', function(next) {
    const otpHash = bcrypt.hashSync(this.otp, 10);
    this.otp = otpHash;
    next();
});

module.exports = mongoose.model("Otp",otpSchema);