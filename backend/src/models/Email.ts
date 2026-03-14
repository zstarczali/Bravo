import mongoose, { Schema } from 'mongoose';
import { IEmail } from '../types';

const emailSchema = new Schema<IEmail>({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  lastEvaluationDate: {
    type: Date,
    default: null
  },
  evaluationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Email = mongoose.model<IEmail>('Email', emailSchema);

export default Email;
