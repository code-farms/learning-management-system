import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { ErrorMiddleware } from "./middlewares/errors";
import userRouter from "./routes/user.route";
import ApiError from "./utils/apiError";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(ErrorMiddleware);

// Routes
app.use("/api/v1", userRouter);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Kya hal h bhai!");
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new ApiError(404, `Route ${req.originalUrl} is not}`);
  err.statusCode = 404;
  next(err);
});

export default app;
