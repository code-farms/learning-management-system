import { Router } from "express";
import { registerUser } from "../controllers/user.controllers";

const userRouter = Router();

userRouter.post("/user-registration", registerUser);

export default userRouter;
