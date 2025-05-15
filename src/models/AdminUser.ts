
import mongoose, { Document, Schema } from 'mongoose';

export interface AdminUser extends Document {
  username: string;
  email?: string;
  passwordHash: string;
  permissions: string[];
  createdAt: Date;
}

const AdminUserSchema = new Schema<AdminUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, sparse: true },
  passwordHash: { type: String, required: true },
  permissions: { type: [String], required: true, default: ['default'] },
  createdAt: { type: Date, default: Date.now }
});

// Only create the model if it doesn't exist already
export default mongoose.models.AdminUser || mongoose.model<AdminUser>('AdminUser', AdminUserSchema);
