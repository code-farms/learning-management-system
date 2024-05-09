import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { ErrorMiddleware } from "./middlewares/errors";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(ErrorMiddleware);

export default app;
