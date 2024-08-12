import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { generateAccessToken, generateRefreshToken } from "../lib/utils";
import User from "../models/users.mode";

export const signUp = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ data: errors.array() });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const photoURL = `${baseUrl}/api/users/photos/${req.file?.filename}`;

    // checking user exists or not using the email
    const isUserExists = await User.findOne({ email: req.body.email });
    if (isUserExists)
      return res.status(400).json({ message: "The email is already in use" });

    // built-in utils function to refresh and access tokens
    const refreshToken = generateRefreshToken(userData.email, "User");
    const accessToken = generateAccessToken(refreshToken);

    userData.photo = photoURL;
    userData.createdAt = Date.now();
    userData.updatedAt = Date.now();
    userData.accessToken = accessToken;
    userData.refreshToken = refreshToken;

    const newUser = new User(userData);

    const result = await newUser.save();
    if (!result) {
      return res.status(500).json({ message: "Internal server error" });
    }

    // setting accessToken to the browser cookie for authentication
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 3600000),
    });

    res.json({ message: "User was created successfully" });
  } catch (error) {
    console.log(__filename, error);
    res.status(500).json({ message: "Internal server error" });
  }
};
