import mongoose, { Document, Schema } from 'mongoose';

export interface IPhrase extends Document {
  text: string;
  category: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const phraseSchema = new Schema<IPhrase>({
  text: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['positive', 'improvement', 'achievement', 'skill', 'teamwork', 'leadership', 'other'],
    default: 'other'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IPhrase>('Phrase', phraseSchema);
