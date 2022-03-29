import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

enum role {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
}

interface IUser {
  email: string;
  password: string;
  who: role;
}

interface IUserDoc extends IUser, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  checkPassword: (password: string) => Promise<boolean>;
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
    },
    password: { type: String, required: true },
    who: { type: String, required: true },
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

userSchema.pre('save', async function () {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
  }
});

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.build = (attrs: IUser) => {
  return new User(attrs);
};

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema);

export { User, IUser, IUserDoc, role };
