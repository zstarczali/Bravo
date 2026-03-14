"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Email_1 = __importDefault(require("../models/Email"));
const Evaluation_1 = __importDefault(require("../models/Evaluation"));
const router = express_1.default.Router();
// Get all emails
router.get('/', async (req, res) => {
    try {
        const emails = await Email_1.default.find().sort({ lastEvaluationDate: -1 });
        res.json(emails);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get single email with evaluations
router.get('/:id', async (req, res) => {
    try {
        const email = await Email_1.default.findById(req.params.id);
        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }
        const evaluations = await Evaluation_1.default.find({ emailId: req.params.id }).sort({ createdAt: -1 });
        res.json({ email, evaluations });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Create new email
router.post('/', async (req, res) => {
    try {
        const { email, name } = req.body;
        const existingEmail = await Email_1.default.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const newEmail = new Email_1.default({ email, name });
        const savedEmail = await newEmail.save();
        res.status(201).json(savedEmail);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Update email
router.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const updatedEmail = await Email_1.default.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (!updatedEmail) {
            return res.status(404).json({ message: 'Email not found' });
        }
        res.json(updatedEmail);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Delete email
router.delete('/:id', async (req, res) => {
    try {
        const deletedEmail = await Email_1.default.findByIdAndDelete(req.params.id);
        if (!deletedEmail) {
            return res.status(404).json({ message: 'Email not found' });
        }
        await Evaluation_1.default.deleteMany({ emailId: req.params.id });
        res.json({ message: 'Email and associated evaluations deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
