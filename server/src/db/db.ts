import mongoose from "mongoose";
import { DB_NAME } from "../constants";

/**
 * Establishes a connection to the MongoDB database.
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 */
const connectDB = async (): Promise<void> => {
  try {
    const connectionInstance: any = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB connected !! DB HOST : `,
      connectionInstance.connection.port
    );
  } catch (error: any) {
    console.error("MONGODB connection FAILED ", error);
  }
};

export default connectDB;
