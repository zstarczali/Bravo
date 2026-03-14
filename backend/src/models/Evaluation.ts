import mongoose, { Schema } from 'mongoose';
import { IEvaluation } from '../types';

const evaluationSchema = new Schema<IEvaluation>({
  emailId: {
    type: String,
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
  approved: {
    type: Boolean,
    default: false
  },
  sent: {
    type: Boolean,
    default: false
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Evaluation = mongoose.model<IEvaluation>('Evaluation', evaluationSchema);

export default Evaluation;
