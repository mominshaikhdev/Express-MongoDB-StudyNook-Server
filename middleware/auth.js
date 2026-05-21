import { verifyToken } from '../utils/jwt.js';

const extractToken = (req) =>
{

  const authHeader = req.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return req.cookies?.token || null;
};

export const authMiddleware = (req, res, next) =>
{
  try
  {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId };
    next();
  } catch
  {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req, _res, next) =>
{
  try
  {
    const token = extractToken(req);
    if (token)
    {
      const decoded = verifyToken(token);
      req.user = { id: decoded.userId };
    }
  } catch { }
  next();
};
