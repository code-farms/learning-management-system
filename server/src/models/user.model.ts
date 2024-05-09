import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
import { timeStamp } from "console";

const emailRegex: RegExp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

interface UserInterface extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVarified: boolean;
  courses: Array<{ courseid: string }>;
  /**
   * Compares the provided password with the stored password.
   * @param password - The password to compare.
   * @returns A Promise that resolves to a boolean indicating whether the passwords match.
   */
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserInterface>(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: {
        /**
         * Validates if a given value is a valid email address.
         * @param value - The value to be validated.
         * @returns True if the value is a valid email address, false otherwise.
         */
        validator: (value: string) => {
          return emailRegex.test(value);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVarified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseid: String,
      },
    ],
  },
  { timestamps: true }
);

/**
 * Middleware function that is executed before saving a user document.
 * It hashes the password if it has been modified.
 * @param next - The next function to be called in the middleware chain.
 */
userSchema.pre<UserInterface>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/**
 * Compares the provided password with the hashed password stored in the user schema.
 * @param {string} password - The password to compare.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<UserInterface>("User", userSchema);
export { User, UserInterface };
