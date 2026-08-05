const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshTokenHash: {
    type: String,
    required: true
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
  }
},{
  timestamps: true,
  expires: 7 * 24 * 60 * 60 // Session expires after 7 days
});

module.exports = mongoose.model('Session', sessionSchema);