import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import { User } from "../models/user.model";
import jwt, { Secret } from "jsonwebtoken";
import path from "path";
import ejs from "ejs";
import sendEmail from "../utils/sendMail";

interface RegisterUserInterface {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    /**
     * Checks if any of the given fields are empty or contain only whitespace characters.
     * If any field is empty or contains only whitespace characters, throws an ApiError with status code 400 and a corresponding error message.
     */
    if ([name, email, password].some((fields) => fields?.trim() === "")) {
      throw new ApiError(400, "Please fill all fields");
    }

    const isUserExists = await User.findOne({ email });

    if (isUserExists) {
      throw new ApiError(409, "User already exists");
    }

    const user: RegisterUserInterface = {
      name,
      email,
      password,
    };

    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const data = { user: { user: user.name }, activationCode };
    const html = await ejs.renderFile(
      path.join(__dirname, "./../mails/activation-mail.ejs"),
      data
    );

    try {
      await sendEmail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email : ${user.email}  to activate your account`,
        activationToken: activationToken.token,
      });
    } catch (error: any) {
      return next(new ApiError(400, error.message));
    }
  }
);

interface ActivationTokenInterface {
  token: string;
  activationCode: string;
}

const createActivationToken = (
  user: RegisterUserInterface
): ActivationTokenInterface => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

// const avatarLocalPath = (
//   req.files as { [fieldname: string]: Express.Multer.File[] }
// )?.avatar?.[0]?.path;

// const user = await User.create({ name, email, password });

// const createdUser = await User.findById(user._id).select(
//   "-password -refreshToken"
// );

// if (!createdUser) {
//   throw new ApiError(500, "Something went wrong while creating a new user");
// }

export { registerUser };
