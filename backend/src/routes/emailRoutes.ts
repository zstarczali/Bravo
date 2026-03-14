import express, { Request, Response } from 'express';
import Email from '../models/Email';
import Evaluation from '../models/Evaluation';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Get all emails
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const emails = await Email.find({ userId: req.userId }).sort({ lastEvaluationDate: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Get single email with evaluations
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, userId: req.userId });
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    const evaluations = await Evaluation.find({ emailId: req.params.id }).sort({ createdAt: -1 });
    res.json({ email, evaluations });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Create new email
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { email, name } = req.body;
    
    const existingEmail = await Email.findOne({ email, userId: req.userId });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists in your list' });
    }

    const newEmail = new Email({ email, name, userId: req.userId });
    const savedEmail = await newEmail.save();
    res.status(201).json(savedEmail);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Update email
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const updatedEmail = await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name },
      { new: true }
    );
    if (!updatedEmail) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.json(updatedEmail);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Delete email
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const deletedEmail = await Email.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deletedEmail) {
      return res.status(404).json({ message: 'Email not found' });
    }
    await Evaluation.deleteMany({ emailId: req.params.id });
    res.json({ message: 'Email and associated evaluations deleted' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Migration: Assign existing emails without userId to current user
router.post('/migrate-to-user', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await Email.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: req.userId } }
    );
    res.json({ 
      message: `Migrated ${result.modifiedCount} employees to your account`,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
