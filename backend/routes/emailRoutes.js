import express from 'express';
import Email from '../models/Email.js';
import Evaluation from '../models/Evaluation.js';

const router = express.Router();

// Get all emails
router.get('/', async (req, res) => {
  try {
    const emails = await Email.find().sort({ lastEvaluationDate: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single email with evaluations
router.get('/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    const evaluations = await Evaluation.find({ emailId: req.params.id }).sort({ createdAt: -1 });
    res.json({ email, evaluations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new email
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newEmail = new Email({ email, name });
    const savedEmail = await newEmail.save();
    res.status(201).json(savedEmail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update email
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updatedEmail = await Email.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!updatedEmail) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.json(updatedEmail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete email
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmail = await Email.findByIdAndDelete(req.params.id);
    if (!deletedEmail) {
      return res.status(404).json({ message: 'Email not found' });
    }
    await Evaluation.deleteMany({ emailId: req.params.id });
    res.json({ message: 'Email and associated evaluations deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
