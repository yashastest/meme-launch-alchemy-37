
import mongoose, { Document, Schema } from 'mongoose';

export interface TokenDocument extends Document {
  symbol: string;
  name: string;
  address?: string;
  ownerWallet: string;
  launchStatus: 'upcoming' | 'live' | 'flagged';
  marketCap?: number;
  volume24h?: number;
  launchDate?: Date;
  createdAt: Date;
}

const TokenSchema = new Schema<TokenDocument>({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String },
  ownerWallet: { type: String, required: true },
  launchStatus: { 
    type: String, 
    required: true, 
    enum: ['upcoming', 'live', 'flagged'],
    default: 'upcoming'
  },
  marketCap: { type: Number },
  volume24h: { type: Number },
  launchDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Only create the model if it doesn't exist already
export default mongoose.models.Token || mongoose.model<TokenDocument>('Token', TokenSchema);
