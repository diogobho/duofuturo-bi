import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import redisClient from '../config/redis.js';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store session in Redis
    const sessionData = {
      userId: user.id,
      username: user.username,
      nome: user.nome,
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    await redisClient.setEx(
      `session:${user.id}`,
      15 * 60, // 15 minutes
      JSON.stringify(sessionData)
    );

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh:${user.id}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { username, password, nome, email, data_nascimento, endereco, role = 'viewer' } = req.body;

    // Check if user already exists
    const existingUserQuery = 'SELECT id FROM users WHERE email = $1 OR username = $2';
    const existingUserResult = await pool.query(existingUserQuery, [email, username]);

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertUserQuery = `
      INSERT INTO users (username, password, nome, email, data_nascimento, endereco, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, username, nome, email, role, created_at
    `;

    const newUserResult = await pool.query(insertUserQuery, [
      username, hashedPassword, nome, email, data_nascimento, endereco, role
    ]);

    const newUser = newUserResult.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        nome: newUser.nome,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Get user data
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Update session in Redis
    const sessionData = {
      userId: user.id,
      username: user.username,
      nome: user.nome,
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    await redisClient.setEx(
      `session:${user.id}`,
      15 * 60,
      JSON.stringify(sessionData)
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = req.user.userId;

    if (token) {
      // Add token to blacklist
      const decoded = jwt.decode(token);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      
      if (expiresIn > 0) {
        await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
      }
    }

    // Remove session and refresh token from Redis
    await Promise.all([
      redisClient.del(`session:${userId}`),
      redisClient.del(`refresh:${userId}`)
    ]);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, data_nascimento, new_password } = req.body;

    // Find user by email and birth date
    const userQuery = 'SELECT id FROM users WHERE email = $1 AND data_nascimento = $2';
    const userResult = await pool.query(userQuery, [email, data_nascimento]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or invalid birth date' });
    }

    const user = userResult.rows[0];

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const updateQuery = 'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(updateQuery, [hashedPassword, user.id]);

    // Invalidate all sessions for this user
    await Promise.all([
      redisClient.del(`session:${user.id}`),
      redisClient.del(`refresh:${user.id}`)
    ]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};