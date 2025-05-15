
import { connectMongo } from '@/lib/mongodb';
import AdminUserModel, { AdminUser } from '@/models/AdminUser';
import TokenModel, { TokenDocument } from '@/models/Token';
import SubmissionModel, { SubmissionDocument } from '@/models/CreatorSubmission';
import bcrypt from 'bcryptjs';

// MongoDB schema examples - using export type for type re-exports
export { AdminUser };
export type { TokenDocument as TokenData };
export type { SubmissionDocument as CreatorSubmission };

// Real MongoDB service implementation
class MongoDbService {
  // Admin management
  async getAdminByUsername(username: string): Promise<AdminUser | null> {
    try {
      await connectMongo();
      return await AdminUserModel.findOne({ username }).lean();
    } catch (error) {
      console.error('Error getting admin by username:', error);
      return null;
    }
  }

  async createAdmin(adminData: Omit<AdminUser, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): Promise<AdminUser | null> {
    try {
      await connectMongo();
      
      // Check if admin already exists
      const existingAdmin = await AdminUserModel.findOne({ username: adminData.username });
      if (existingAdmin) {
        throw new Error('Admin with this username already exists');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminData.password, salt);
      
      // Create new admin
      const newAdmin = new AdminUserModel({
        username: adminData.username,
        email: adminData.email,
        passwordHash,
        permissions: adminData.permissions,
      });
      
      await newAdmin.save();
      return newAdmin.toObject();
    } catch (error) {
      console.error('Error creating admin:', error);
      return null;
    }
  }

  async validateAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
    try {
      await connectMongo();
      const admin = await AdminUserModel.findOne({ username });
      
      if (!admin) return null;
      
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) return null;
      
      return admin.toObject();
    } catch (error) {
      console.error('Error validating admin credentials:', error);
      return null;
    }
  }
  
  // Creator submissions
  async getSubmissions(status?: string): Promise<SubmissionDocument[]> {
    try {
      await connectMongo();
      
      const query = status ? { status } : {};
      return await SubmissionModel.find(query).sort({ createdAt: -1 }).lean();
    } catch (error) {
      console.error('Error getting submissions:', error);
      return [];
    }
  }
  
  async createSubmission(submission: Omit<SubmissionDocument, 'id' | 'createdAt' | 'status'>): Promise<SubmissionDocument | null> {
    try {
      await connectMongo();
      
      const newSubmission = new SubmissionModel({
        ...submission,
        status: 'pending',
      });
      
      await newSubmission.save();
      return newSubmission.toObject();
    } catch (error) {
      console.error('Error creating submission:', error);
      return null;
    }
  }
  
  async updateSubmissionStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
      await connectMongo();
      
      const result = await SubmissionModel.updateOne(
        { _id: id }, 
        { $set: { status } }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating submission status:', error);
      return false;
    }
  }
  
  // Token management
  async getTokens(filters?: Record<string, any>): Promise<TokenDocument[]> {
    try {
      await connectMongo();
      
      return await TokenModel.find(filters || {})
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      console.error('Error getting tokens:', error);
      return [];
    }
  }
  
  async createToken(tokenData: any): Promise<TokenDocument | null> {
    try {
      await connectMongo();
      
      const newToken = new TokenModel(tokenData);
      await newToken.save();
      
      return newToken.toObject();
    } catch (error) {
      console.error('Error creating token:', error);
      return null;
    }
  }
  
  async updateToken(id: string, tokenData: Partial<TokenDocument>): Promise<boolean> {
    try {
      await connectMongo();
      
      const result = await TokenModel.updateOne(
        { _id: id }, 
        { $set: tokenData }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating token:', error);
      return false;
    }
  }

  async getTokenByAddress(address: string): Promise<TokenDocument | null> {
    try {
      await connectMongo();
      return await TokenModel.findOne({ address }).lean();
    } catch (error) {
      console.error('Error getting token by address:', error);
      return null;
    }
  }
}

// Export singleton instance
export const mongoDbService = new MongoDbService();
export default mongoDbService;
