import { Router } from "express";
import { uploadCourse } from "../controllers/course.controllers";
import { isAuthenticated, isAuthorizedRole } from "../middlewares/auth";

const courseRouter = Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  isAuthorizedRole("admin"),
  uploadCourse
);

export default courseRouter;
