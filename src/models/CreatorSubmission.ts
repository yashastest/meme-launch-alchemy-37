
import mongoose, { Document, Schema } from 'mongoose';

export interface SubmissionDocument extends Document {
  walletAddress: string;
  email: string;
  telegram?: string;
  projectName: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const SubmissionSchema = new Schema<SubmissionDocument>({
  walletAddress: { type: String, required: true },
  email: { type: String, required: true },
  telegram: { type: String },
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

// Only create the model if it doesn't exist already
export default mongoose.models.CreatorSubmission || 
  mongoose.model<SubmissionDocument>('CreatorSubmission', SubmissionSchema);
