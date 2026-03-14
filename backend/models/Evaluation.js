import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  evaluation: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

export default Evaluation;
