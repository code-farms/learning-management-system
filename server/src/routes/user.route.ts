import { Router } from "express";
import {
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  updateAccessAndRefreshToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
} from "../controllers/user.controllers";
import { isAuthenticated, isAuthorizedRole } from "../middlewares/auth";
import { upload } from "../middlewares/uploadFiles";

const userRouter = Router();

userRouter.post("/user-registration", registerUser);
// userRouter.post("/user-activation", activateUserAccount);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/update-tokens", updateAccessAndRefreshToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);
userRouter.put("/update-password", isAuthenticated, updatePassword);
userRouter.put(
  "/update-profile-picture",
  isAuthenticated,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateProfilePicture
);

export default userRouter;
