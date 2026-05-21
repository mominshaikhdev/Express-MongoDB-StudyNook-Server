import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

const corsOptions = {
  origin: (origin, cb) =>
  {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(cors(corsOptions));



app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());


app.use(async (_req, _res, next) =>
{
  try
  {
    await connectDB();
    next();
  } catch (err)
  {
    next(err);
  }
});

app.get('/', (_req, res) =>
  res.json({ name: 'StudyNook API', status: 'ok', time: new Date().toISOString() })
);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(notFound);
app.use(errorHandler);


export default app;

// Local dev only
if (process.env.NODE_ENV !== 'production')
{
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 StudyNook API running on :${PORT}`));
}
