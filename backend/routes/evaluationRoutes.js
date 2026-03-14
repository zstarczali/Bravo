import express from 'express';
import OpenAI from 'openai';
import Evaluation from '../models/Evaluation.js';
import Email from '../models/Email.js';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate AI evaluation
router.post('/generate', async (req, res) => {
  try {
    const { emailId, prompt } = req.body;

    if (!emailId || !prompt) {
      return res.status(400).json({ message: 'Email ID and prompt are required' });
    }

    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate evaluation using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Te egy szakmai HR asszisztens vagy, aki munkatársi értékeléseket készít. Készíts 3-5 bekezdés hosszú, professzionális, pozitív hangvételű értékelést a megadott információk alapján. Az értékelés legyen konkrét, konstruktív és motiváló. Használj szakmai nyelvezetet, de maradj emberközeli. Strukturáld az értékelést: kezdd az általános teljesítménnyel, majd térj ki specifikus eredményekre, végül adj forward-looking perspektívát."
        },
        {
          role: "user",
          content: `Készíts értékelést a következő információk alapján:\n\n${prompt}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const evaluationText = completion.choices[0].message.content;

    // Save evaluation
    const newEvaluation = new Evaluation({
      emailId,
      prompt,
      evaluation: evaluationText
    });
    await newEvaluation.save();

    // Update email's last evaluation date
    email.lastEvaluationDate = new Date();
    email.evaluationCount += 1;
    await email.save();

    res.status(201).json(newEvaluation);
  } catch (error) {
    console.error('Error generating evaluation:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all evaluations for an email
router.get('/email/:emailId', async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ emailId: req.params.emailId }).sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete evaluation
router.delete('/:id', async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    await Evaluation.findByIdAndDelete(req.params.id);
    
    // Update email's evaluation count and last evaluation date
    const email = await Email.findById(evaluation.emailId);
    if (email) {
      email.evaluationCount = Math.max(0, email.evaluationCount - 1);
      const lastEval = await Evaluation.findOne({ emailId: evaluation.emailId }).sort({ createdAt: -1 });
      email.lastEvaluationDate = lastEval ? lastEval.createdAt : null;
      await email.save();
    }

    res.json({ message: 'Evaluation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
