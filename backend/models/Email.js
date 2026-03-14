import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
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

const Email = mongoose.model('Email', emailSchema);

export default Email;
