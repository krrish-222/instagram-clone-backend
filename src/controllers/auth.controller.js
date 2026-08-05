const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Session = require('../models/session.model');

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
    await newUser.save();

    // Generate tokens
    const refreshToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });   
    const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10); // Hash the refresh token before storing it

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' ,expires: 7 * 24 * 60 * 60 * 1000 }); // Set cookie for 7 days
    
    //creating session
    const session = new Session({ userId: newUser._id, refreshTokenHash, ip: req.ip, userAgent: req.get('User-Agent') });
    await session.save();
    res.status(201).json({ message: 'User registered successfully' });

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
    let user;
    if(!email){
      user = await User.findOne({username })
    }
    else{
      user = await User.findOne({ email });
    }
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate refresh token
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10); // Hash the refresh token before storing it
    
    // Save session
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' });
    const session = new Session({ userId: user._id, refreshTokenHash, ip: req.ip, userAgent: req.get('User-Agent')  });
    await session.save();

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
    const session = await Session.findOne({ userId: decoded.userId });
    if (!session) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (session.isRevoked) {
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    // Compare the provided refresh token with the stored hash
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isRefreshTokenValid) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate a new access token
    const accessToken = jwt.sign({ userId: decoded.userId, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    //generate a new refresh token and update the session
    const newRefreshToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' ,expires: 7 * 24 * 60 * 60 * 1000 }); // Set cookie for 7 days
    
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
    const session = await Session.findOne({ userId: decoded.userId });
    if (!session) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Revoke the session
    session.isRevoked = true;
    await session.save();

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};