import { Document } from 'mongoose';

export interface IEmail extends Document {
  email: string;
  name: string;
  userId: string;
  lastEvaluationDate: Date | null;
  evaluationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvaluation extends Document {
  emailId: string;
  prompt: string;
  evaluation: string;
  approved?: boolean;
  sent?: boolean;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
