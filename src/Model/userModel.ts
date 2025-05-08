import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  number: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  profilePicture?: string;
  grade: string;
  stream: string;
  bio: string;
  isVerified: boolean;
  subjects: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
    },
    number: {
      type: String,
      required: [true, 'Number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    profilePicture: {
      type: String,
      default:
        'https://res.cloudinary.com/dqj0xg3zv/image/upload/v1698236482/DefaultProfilePicture.png',
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
    stream: {
      type: String,
      required: [true, 'Stream is required'],
      trim: true,
    },
    bio: {
      type: String,
      default: 'Hey there! I am using BSEBCampus.',
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    subjects: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 🔍 Password comparison method
UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};


const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
