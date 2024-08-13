import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import fs from "fs";
import path from "path";
import {
  encodingToBase64,
  generateAccessToken,
  generateRandomCode,
  generateRefreshToken,
  sendVerificationCode,
} from "../lib/utils";
import User from "../models/users.model";
import { uploadDir } from "../routes/users.route";

// Sign up user
export const signUp = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ data: errors.array() });
    }

    // getting photo url
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const photoURL = `${baseUrl}/api/users/photos/${req.file?.filename}`;

    // checking user exists or not using the email
    const isUserExists = await User.findOne({ email: req.body.email });
    if (isUserExists)
      return res.status(400).json({ message: "The email is already in use" });

    //Utils functions to generate refresh and access tokens
    const refreshToken = generateRefreshToken(userData.email, "User");
    const accessToken = generateAccessToken(userData.email, "User");

    userData.photo = photoURL;
    userData.createdAt = Date.now();
    userData.updatedAt = Date.now();
    userData.refreshToken = refreshToken;

    const newUser = new User(userData);

    const result = await newUser.save();
    if (!result) {
      return res.status(500).json({ message: "Internal server error" });
    }

    // sending a verification code to the user's email
    const code = generateRandomCode(); // utils function
    await sendVerificationCode(userData.name, userData.email, code);

    // setting accessToken to the browser cookie for authentication
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 3600000), // expires in 1h
    });

    // setting hashed userId to the user's browser
    res.cookie("userId", encodingToBase64(newUser._id.toString()), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 86400000), // expires in 1d
    });

    res.json({ message: "User was created successfully" });
  } catch (error) {
    console.log(__filename, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Sign in user
export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ data: errors.array() });
    }

    // checking user exists or not using the email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Utils functions to generate refresh and access tokens
    const refreshToken = generateRefreshToken(email, user.role);
    const accessToken = generateAccessToken(email, user.role);

    // update refresh token
    await User.findOneAndUpdate({ email }, { $set: { refreshToken } });

    // setting accessToken to the browser cookie for authentication
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 3600000), // expires in 1h
    });

    // setting hashed userId to the user's browser
    res.cookie("userId", encodingToBase64(user._id.toString()), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 86400000), // expires in 1d
    });

    res.json({ message: "User login successful", data: user });
  } catch (error) {
    console.log(__filename, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get verification code
export const verificationCode = async (req: Request, res: Response) => {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // sending a verification code to the user's email
    const code = generateRandomCode(); // utils function
    await sendVerificationCode(userData.name, userData.email, code);

    res.json({ message: "Code was sent" });
  } catch (error) {
    console.log(__filename, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get single photo by the filename
export const getPhoto = async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  // if the file exists send the response else send error
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
};
