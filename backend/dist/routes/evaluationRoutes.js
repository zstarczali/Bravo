"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const Evaluation_1 = __importDefault(require("../models/Evaluation"));
const Email_1 = __importDefault(require("../models/Email"));
const router = express_1.default.Router();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
// Generate AI evaluation
router.post('/generate', async (req, res) => {
    try {
        const { emailId, prompt } = req.body;
        if (!emailId || !prompt) {
            return res.status(400).json({ message: 'Email ID and prompt are required' });
        }
        const email = await Email_1.default.findById(emailId);
        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }
        // Generate evaluation using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Te egy szakmai értékelő asszisztens vagy. Készíts rövid, pozitív és konstruktív értékelést a megadott prompt alapján."
                },
                {
                    role: "user",
                    content: `Értékeld a következő munkát/teljesítményt: ${prompt}`
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });
        const evaluationText = completion.choices[0].message.content;
        // Save evaluation
        const newEvaluation = new Evaluation_1.default({
            emailId,
            prompt,
            evaluation: evaluationText || ''
        });
        await newEvaluation.save();
        // Update email's last evaluation date
        email.lastEvaluationDate = new Date();
        email.evaluationCount += 1;
        await email.save();
        res.status(201).json(newEvaluation);
    }
    catch (error) {
        console.error('Error generating evaluation:', error);
        res.status(500).json({ message: error.message });
    }
});
// Get all evaluations for an email
router.get('/email/:emailId', async (req, res) => {
    try {
        const evaluations = await Evaluation_1.default.find({ emailId: req.params.emailId }).sort({ createdAt: -1 });
        res.json(evaluations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Delete evaluation
router.delete('/:id', async (req, res) => {
    try {
        const evaluation = await Evaluation_1.default.findById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }
        await Evaluation_1.default.findByIdAndDelete(req.params.id);
        // Update email's evaluation count and last evaluation date
        const email = await Email_1.default.findById(evaluation.emailId);
        if (email) {
            email.evaluationCount = Math.max(0, email.evaluationCount - 1);
            const lastEval = await Evaluation_1.default.findOne({ emailId: evaluation.emailId }).sort({ createdAt: -1 });
            email.lastEvaluationDate = lastEval ? lastEval.createdAt : null;
            await email.save();
        }
        res.json({ message: 'Evaluation deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
