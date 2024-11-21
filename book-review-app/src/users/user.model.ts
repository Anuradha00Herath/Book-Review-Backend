import { Schema, model, Document, Model } from 'mongoose';
const bcrypt = require('bcrypt');

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role?: string;
  isModified: (field: string) => boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});

//hashing password
userSchema.pre('save', async function (next) {
  const user = this as IUser;

  if (!user.isModified('password')) return next();
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  next();
});

// match password
userSchema.methods.comparePassword = async function (
    candidatePassword: string
  ): Promise<boolean> {
    const user = this as IUser;
    return bcrypt.compare(candidatePassword, user.password);
  };



const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;
