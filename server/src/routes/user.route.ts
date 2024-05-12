import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controllers";

const userRouter = Router();

userRouter.post("/user-registration", registerUser);
// userRouter.post("/user-activation", activateUserAccount);
userRouter.post("/login", loginUser);

export default userRouter;
