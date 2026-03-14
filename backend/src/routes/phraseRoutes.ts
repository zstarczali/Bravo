import express, { Response } from 'express';
import Phrase from '../models/Phrase';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Get all phrases for current user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const phrases = await Phrase.find({ userId: req.userId }).sort({ category: 1, createdAt: -1 });
    res.json(phrases);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Get phrases by category
router.get('/category/:category', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const phrases = await Phrase.find({ 
      userId: req.userId,
      category: req.params.category 
    }).sort({ createdAt: -1 });
    res.json(phrases);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Create new phrase
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { text, category } = req.body;

    if (!text || !category) {
      return res.status(400).json({ message: 'Text and category are required' });
    }

    const phrase = await Phrase.create({
      text,
      category,
      userId: req.userId
    });

    res.status(201).json(phrase);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Update phrase
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { text, category } = req.body;

    const phrase = await Phrase.findOne({ _id: req.params.id, userId: req.userId });
    if (!phrase) {
      return res.status(404).json({ message: 'Phrase not found' });
    }

    if (text) phrase.text = text;
    if (category) phrase.category = category;

    await phrase.save();
    res.json(phrase);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Delete phrase
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const phrase = await Phrase.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!phrase) {
      return res.status(404).json({ message: 'Phrase not found' });
    }

    res.json({ message: 'Phrase deleted' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
