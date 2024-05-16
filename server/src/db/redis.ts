import dotenv from "dotenv";
import { Redis } from "ioredis";
dotenv.config({
  path: "./.env",
});

/**
 * Establishes a connection to a Redis server and performs basic operations.
 */

const redisClient = () => {
  if (process.env.REDIS_URI) {
    console.log("Redis connection established successfully.");
    return process.env.REDIS_URI;
  }
  throw new Error("Redis URI is not defined.");
};

export const redis = new Redis(redisClient());
