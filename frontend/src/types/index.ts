export interface IEmail {
  _id: string;
  email: string;
  name: string;
  userId: string;
  lastEvaluationDate: Date | null;
  evaluationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvaluation {
  _id: string;
  emailId: string;
  prompt: string;
  evaluation: string;
  approved?: boolean;
  sent?: boolean;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPhrase {
  _id: string;
  text: string;
  category: 'positive' | 'improvement' | 'achievement' | 'skill' | 'teamwork' | 'leadership' | 'other';
  userId: string;
  createdAt: Date;
}

export interface EmailWithEvaluations {
  email: IEmail;
  evaluations: IEvaluation[];
}
