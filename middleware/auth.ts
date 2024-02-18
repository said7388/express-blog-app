import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { database } from "../config/db.config";
import { User } from "../model/user.model";
import { userSchema } from "../schema";

export const verifyAuthenticUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  let tokenWithoutBearer = null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  if (token && token.startsWith("Bearer ")) {
    // Remove the "Bearer " keyword and extract the token
    tokenWithoutBearer = token.split(" ")[1];
  }

  jwt.verify(tokenWithoutBearer as string, process.env.JWT_SECRTE as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
}

export const validateInput = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }

  const sqlQuery = `SELECT * FROM Users WHERE email = '${email}';`;
  const connection = await database();

  try {
    const [users] = await connection.query<User[]>(sqlQuery);

    if (users.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists with the email!",
      });
    }
    next();
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong!"
    });
  }
};