import dotenv from "dotenv";
import app from "./app";
import connectDB from "./db/db";
// import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const port: string = process.env.PORT || "5000";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error: any) => {
    console.log("MONGO DB connection failed !!! ", error);
  });
