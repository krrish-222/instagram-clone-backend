const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshTokenHash: {
    type: String,
    required: false
  },
  ip:{
    type: String,
    required: true
  },
  userAgent:{
    type: String,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  expiresAt:{
        type:Date,
        required:true,
        expires:0
    }
},{
  timestamps: true,
});

module.exports = mongoose.model('Session', sessionSchema);