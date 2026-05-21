import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { signToken, cookieOptions } from '../utils/jwt.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const passwordValid = (pw) => /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(pw);

export const register = async (req, res) =>
{
  const { name, email, password, photoURL } = req.body || {};
  if (!name || !email || !password || !photoURL)
    return res.status(400).json({ message: 'All fields required' });
  if (!passwordValid(password))
    return res.status(400).json({ message: 'Password must be 6+ chars with uppercase & lowercase' });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hash,
    photoURL,
    provider: 'local',
  });
  res.status(201).json({
    message: 'Registration successful',
    user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
  });
};

export const login = async (req, res) =>
{
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.password)
    return res.status(401).json({ message: 'Invalid email or password' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

  const token = signToken({ userId: user._id });


  res.cookie('token', token, cookieOptions()).json({
    user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
  });
};

export const googleAuth = async (req, res) =>
{
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ message: 'Missing Google credential' });
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) return res.status(401).json({ message: 'Invalid Google token' });

  let user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user)
  {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email.toLowerCase(),
      photoURL: payload.picture || 'https://i.pravatar.cc/150',
      provider: 'google',
    });
  }
  const token = signToken({ userId: user._id });


  res.cookie('token', token, cookieOptions()).json({
    user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
  });
};

export const logout = (_req, res) =>
{

  res.clearCookie('token', cookieOptions()).json({ message: 'Logged out' });
};

export const me = async (req, res) =>
{
  const user = await User.findById(req.user.id).select('name email photoURL');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL } });
};
