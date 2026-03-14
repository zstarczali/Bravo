import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import emailRoutes from './routes/emailRoutes';
import evaluationRoutes from './routes/evaluationRoutes';
import authRoutes from './routes/authRoutes';
import phraseRoutes from './routes/phraseRoutes';

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });
console.log('📁 Loading .env from:', path.join(__dirname, '..', '.env'));
console.log('🔑 GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bravo-points')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/phrases', phraseRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bravo Points Manager API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
