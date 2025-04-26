import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../models/User";

export interface UserPayload {
  userId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}

export const authorizeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-access-token");
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    if (!data?.userId) throw new Error("Invalid token");
    const user = await UserModel.findById(data.userId);
    if (!user) throw new Error("User not found, please login again");
    req.user = data.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
