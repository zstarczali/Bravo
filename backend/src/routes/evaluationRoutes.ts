import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Evaluation from '../models/Evaluation';
import Email from '../models/Email';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { geminiConfig } from '../config/gemini.config';

const router = express.Router();

// Function to get Gemini AI instance (lazy initialization)
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY not found in environment');
    return null;
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Generate AI evaluation
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { emailId, prompt } = req.body;

    if (!emailId || !prompt) {
      return res.status(400).json({ message: 'Email ID and prompt are required' });
    }

    const email = await Email.findOne({ _id: emailId, userId: req.userId });
    if (!email) {
      return res.status(404).json({ message: 'Email not found or access denied' });
    }

    let evaluationText: string;
    let usedFallback = false;

    // Generate evaluation using Gemini if available
    const genAI = getGenAI();
    if (genAI) {
      try {
        console.log('✅ Using Gemini API for generation');
        
        // Use configuration from gemini.config.ts
        const model = genAI.getGenerativeModel({
          model: geminiConfig.model,
          generationConfig: geminiConfig.generationConfig,
          safetySettings: geminiConfig.safetySettings
        });
        
        const userPrompt = `${geminiConfig.systemPrompt}\n\nEvaluate the following work/performance: ${prompt}`;
        
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        evaluationText = response.text();
      } catch (geminiError: any) {
        console.error('⚠️ Gemini API Error:', geminiError.message);
        
        // Check if it's a quota error
        if (geminiError.message?.includes('quota') || geminiError.message?.includes('429')) {
          usedFallback = true;
          evaluationText = `**[AI Quota Exceeded - Using Fallback]**

Based on your prompt: "${prompt}"

**Evaluation:**

${email.name} has demonstrated commendable performance in the evaluated area. Their work shows dedication, attention to detail, and a commitment to quality. They consistently meet expectations and contribute positively to team objectives.

**Key Strengths:**
- Shows professionalism in task execution
- Demonstrates good time management skills  
- Collaborates effectively with team members
- Takes initiative when appropriate

**Note:** This is a template evaluation. For AI-generated detailed evaluations, please check your Gemini API quota at https://aistudio.google.com/app/apikey`;
        } else {
          // Other Gemini errors
          throw geminiError;
        }
      }
    } else {
      console.log('⚠️ Using fallback - Gemini not configured');
      usedFallback = true;
      evaluationText = `[Test evaluation - Gemini not configured]\n\nBased on prompt: ${prompt}\n\nThe employee demonstrated excellent performance. They showed professionalism and commitment during the task execution. They met the set goals on time and demonstrated exemplary cooperation with the team.`;
    }

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
    res.status(500).json({ message: (error as Error).message });
  }
});

// Get all evaluations for an email
router.get('/email/:emailId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Verify email belongs to user
    const email = await Email.findOne({ _id: req.params.emailId, userId: req.userId });
    if (!email) {
      return res.status(404).json({ message: 'Email not found or access denied' });
    }
    
    const evaluations = await Evaluation.find({ emailId: req.params.emailId }).sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Delete evaluation
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Verify email belongs to user
    const email = await Email.findOne({ _id: evaluation.emailId, userId: req.userId });
    if (!email) {
      return res.status(404).json({ message: 'Access denied' });
    }

    await Evaluation.findByIdAndDelete(req.params.id);
    
    // Update email's evaluation count and last evaluation date
    email.evaluationCount = Math.max(0, email.evaluationCount - 1);
    const lastEval = await Evaluation.findOne({ emailId: evaluation.emailId }).sort({ createdAt: -1 });
    email.lastEvaluationDate = lastEval ? lastEval.createdAt : null;
    await email.save();

    res.json({ message: 'Evaluation deleted' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Update evaluation status (approve/send)
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { approved, sent } = req.body;
    
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Verify email belongs to user
    const email = await Email.findOne({ _id: evaluation.emailId, userId: req.userId });
    if (!email) {
      return res.status(404).json({ message: 'Access denied' });
    }

    if (approved !== undefined) {
      evaluation.approved = approved;
    }
    if (sent !== undefined) {
      evaluation.sent = sent;
    }

    await evaluation.save();
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Check for similar evaluations
router.post('/check-similarity', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { emailId, prompt } = req.body;

    if (!emailId || !prompt) {
      return res.status(400).json({ message: 'Email ID and prompt are required' });
    }

    // Verify email belongs to user
    const email = await Email.findOne({ _id: emailId, userId: req.userId });
    if (!email) {
      return res.status(404).json({ message: 'Email not found or access denied' });
    }

    // Find ALL Email records with the same email address (across all users)
    const allEmailsWithSameAddress = await Email.find({ email: email.email });
    const emailIds = allEmailsWithSameAddress.map(e => e._id);

    // Find evaluations for ALL these email records in the last 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentEvaluations = await Evaluation.find({
      emailId: { $in: emailIds },
      createdAt: { $gte: twoWeeksAgo }
    }).sort({ createdAt: -1 });

    if (recentEvaluations.length === 0) {
      return res.json({ hasSimilar: false, similarEvaluations: [] });
    }

    // Use Gemini to check similarity
    const genAI = getGenAI();
    if (!genAI) {
      return res.json({ hasSimilar: false, similarEvaluations: [] });
    }

    const model = genAI.getGenerativeModel({
      model: geminiConfig.model,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    });

    const similarEvaluations = [];

    for (const existingEval of recentEvaluations) {
      const comparisonPrompt = `You are comparing two employee evaluation prompts to detect duplicates or very similar content.

Prompt 1 (New): "${prompt}"
Prompt 2 (Existing): "${existingEval.prompt}"

Are these prompts describing the same or very similar work/achievement? 
Consider them similar if they talk about the same project, task, or accomplishment, even if worded differently.

Respond with ONLY "YES" or "NO".`;

      try {
        const result = await model.generateContent(comparisonPrompt);
        const response = await result.response;
        const answer = response.text().trim().toUpperCase();

        if (answer.includes('YES')) {
          // Get the email record to check if it's from same or different user
          const evalEmail = await Email.findById(existingEval.emailId);
          const isDifferentUser = evalEmail && evalEmail.userId.toString() !== req.userId;
          
          similarEvaluations.push({
            _id: existingEval._id,
            prompt: existingEval.prompt,
            evaluation: existingEval.evaluation,
            createdAt: existingEval.createdAt,
            fromAnotherUser: isDifferentUser
          });
        }
      } catch (error) {
        console.error('Error comparing evaluations:', error);
        // Continue checking other evaluations
      }
    }

    res.json({
      hasSimilar: similarEvaluations.length > 0,
      similarEvaluations
    });
  } catch (error) {
    console.error('Error checking similarity:', error);
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
