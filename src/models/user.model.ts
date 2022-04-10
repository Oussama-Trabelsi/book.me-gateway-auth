import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

enum Role {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
}

interface IUser {
  email: string;
  password: string;
  phone_number: string;
  role: Role;
  accessToken?: string;
  refreshToken?: string;
}

interface IUserDoc extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (password: string) => Promise<boolean>;
}

interface IUserModel extends Model<IUserDoc> {
  build(attrs: IUser): IUserDoc;
}

const userSchema = new Schema<IUserDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Not a valid e-mail address'],
    },
    password: { type: String, required: true },
    phone_number: {
      type: String,
      required: true,
      match: [/^((\+)33)[1-9](\d{2}){4}$/, 'Not a valid phone number'],
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: [Role.CUSTOMER, Role.PROVIDER],
        message: 'Not a valid role',
      },
    },
    accessToken: { type: String, required: false },
    refreshToken: { type: String, required: false },
  },
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  },
);

userSchema.statics.build = (attrs: IUser) => {
  return new User(attrs);
};

userSchema.pre('save', async function (next) {
  // check if password is changed
  try {
    if (!(this.isModified('password') || this.isNew)) next();
    // generate salt
    const salt = await bcrypt.genSalt(10);
    // hash the password
    const hash = await bcrypt.hash(this.password, salt);
    // replace plain text password with hashed password
    this.password = hash;
    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return next(error);
  }
});

userSchema.methods.matchPassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error);
  }
};

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema);

export { User, IUser, IUserDoc, Role };
