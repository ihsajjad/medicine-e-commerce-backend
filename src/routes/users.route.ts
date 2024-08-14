/**
 * Title: User Routes
 * Description: This file defines routes related to user authentication, such as login, registration, and logout.
 * Author: MD Iftekher Hossen Sajjad
 * Date: 11/8/2024
 */

import express from "express";
import { check } from "express-validator";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
  currentUser,
  getPhoto,
  signIn,
  signOut,
  signUp,
  verificationCode,
  verifyEmail,
} from "../controllers/users.controller";
import { verifyTokens } from "../middleware/verifyTokens";

const router = express.Router();

// ================================== Start Multer configuration area ============================
export const uploadDir = path.join(__dirname, "../../public/photos");

// if directory doesn't exist create one
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.split(" ").join("_")}`);
  },
});

const upload = multer({ storage: storage });
// ================================== Start Multer configuration area ============================

// Sign up user
router.post("/sign-up", upload.single("photo"), validateSignUpData(), signUp);

// Sign in user
router.post(
  "/sign-in",
  [
    check("email", "Email is required"),
    check("password", "Password is required"),
  ],
  signIn
);

// Route to sign out user
router.post("/sign-out", verifyTokens, signOut);

// Route to get current user
router.get("/current-user", verifyTokens, currentUser);

// get verification code
router.get("/verification-code", verifyTokens, verificationCode);

// Route to match the verification email
router.post("/verify-email", verifyTokens, verifyEmail);

// getting single photo by the filename
router.get("/photos/:filename", getPhoto);

// validating user input
function validateSignUpData() {
  return [
    check("name", "Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isString(),
    check("photo").isEmpty().withMessage("Photo is required"),
  ];
}

export default router;
