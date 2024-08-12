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
import { getPhoto, signUp } from "../controllers/users.controller";

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

// sign up
router.post("/sign-up", upload.single("photo"), validateSignUpData(), signUp);

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
