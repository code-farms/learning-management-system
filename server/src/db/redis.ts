import { Redis } from "ioredis";

/**
 * Establishes a connection to a Redis server and performs basic operations.
 */
const redisClient = async () => {
  try {
    if (process.env.REDIS_URI) {
      // Create a new Redis client using the provided Redis URI
      const client: any = new Redis(`${process.env.REDIS_URI}`);

      // Set a key-value pair in the Redis server
      client.set("foo", "bar");

      // Retrieve the value of a key from the Redis server
      const result = await client.get("foo");

      return client;
    }
  } catch (error: any) {
    // Log an error message if the Redis connection fails
    console.error("Redis connection FAILED ", error);
  }
};

export default redisClient;
