"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
const evaluationRoutes_1 = __importDefault(require("./routes/evaluationRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB connection
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bravo-points')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
// Routes
app.use('/api/emails', emailRoutes_1.default);
app.use('/api/evaluations', evaluationRoutes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Bravo Points Manager API' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
