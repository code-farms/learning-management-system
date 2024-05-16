import { Response } from "express";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/apiResponse";
import { redis } from "../db/redis";

const getUserById = async (id: string) => {
  // Get the user Info from redis
  const userJson = await redis.get(id);

  if (userJson) {
    return JSON.parse(userJson);
  }

  // Get the user Info from DB
  const user = await User.findById(id);

  return user;
};

export { getUserById };
