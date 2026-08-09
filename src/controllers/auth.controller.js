const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Session = require('../models/session.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({$or: [{ email }, { username }]});
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create a new user
    const newUser = new User({ username, email, password });
    try {
      await newUser.save();
    } catch (error) {
      console.error('Error saving user:', error);
      return res.status(500).json({ message: 'Error saving user', error: error.message });
    }

    //creating session
    const session = new Session({ userId: newUser._id, ip: req.ip, userAgent: req.get('User-Agent') });
    await session.save();

    // Generate refresh token

    const refreshToken = jwt.sign({ userId: newUser._id, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    session.refreshTokenHash = refreshTokenHash;
    session.save();
    try{
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }); // Set cookie for 7 days
    }
    catch(err){
      console.error('Error setting cookie:', err);
      return res.status(500).json({ message: 'Error setting cookie', error: err.message });
    }
     
    
    // genrating access token
    const accessToken = jwt.sign({ userId: newUser._id, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
   
    
    res.status(201).json({ message: 'User registered successfully',
      accessToken
     });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error',
      error: error
     });
  }
};

exports.login = async (req, res) => {
  try {
    const { email,username, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({$or: [{ email }, { username }]});
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    // Create a new session
    const session = new Session({ userId: user._id, ip: req.ip, userAgent: req.get('User-Agent')  });
    await session.save();

    // Generate refresh token
    const refreshToken = jwt.sign({ userId: user._id, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    session.refreshTokenHash = refreshTokenHash;
    await session.save();

    // set the refresh token in a secure cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }); // Set cookie for 7 days
    

    // Generate access token
    const accessToken = jwt.sign({ userId: user._id, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    res.status(200).json({ message: 'Login successful', accessToken });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const session = await Session.findOne({ _id: decoded.sessionId });
    if (!session) {
      res.clearCookie('refreshToken'); // Clear the cookie if the session is invalid
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (session.revoked) {
      res.clearCookie('refreshToken'); // Clear the cookie if the session is revoked
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    const isMatch = crypto.createHash('sha256').update(refreshToken).digest('hex') === session.refreshTokenHash;
    if (!isMatch) {
      res.clearCookie('refreshToken'); // Clear the cookie if the refresh token doesn't match
      await Session.updateMany({ userId: decoded.userId }, { revoked: true }); // Revoke all sessions for the user
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
 
    // Generate a new access token
    const accessToken = jwt.sign({ userId: decoded.userId, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '15m' });


    //generate a new refresh token and update the session
    const newRefreshToken = jwt.sign({ userId: decoded.userId, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    session.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await session.save();

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' ,expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }); // Set cookie for 7 days
  
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const session = await Session.findById(decoded.sessionId);
    if (!session) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Revoke the session
    session.revoked = true;
    await session.save();

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Revoke all sessions for the user
    await Session.updateMany({ userId: decoded.userId }, { revoked: true });

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({ message: 'Logout from all sessions successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};