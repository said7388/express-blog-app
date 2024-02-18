import bcrypt from 'bcrypt';
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { loginSchema } from '../validation-schema/auth';

/**
 * ROUTE: /api/auth/registration
 * METHOD: POST
 * DESC: New user registration
 */
export const userRegistration = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  let hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRTE as string, { expiresIn: "24h" });

    return res.status(201).json({
      success: true,
      message: "User registration successfully!",
      user: user,
      token: token
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again."
    });
  }
};

/**
 * ROUTE: /api/auth/login
 * METHOD: POST
 * DESC: User login with email and password
 */
export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist or invalid email!",
      });
    };

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password!",
      });
    };

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRTE as string, { expiresIn: "24h" });

    return res.status(200).json({
      success: true,
      message: "User login successfully!",
      token: token,
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong!"
    });
  }
};