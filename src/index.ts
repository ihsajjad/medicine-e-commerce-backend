/**
 * Title: Node-Express Project Index File
 * Description: This file serves as the entry point for the Node.js Express application. It initializes the server and sets up routing and middleware.
 * Author: MD Iftekher Hossen Sajjad
 * Date: 11/8/2024
 */

import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "../src/routes/users.route";

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.NODE_ENV === "production" ? "" : "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// connect mongodb database
mongoose
  .connect(process.env.MONGODB_URI as string, { dbName: "care-cube" })
  .then(() => console.log("DB is connected"));

// routes
app.use("/api/users/", userRoutes);

app.get("/", (_, res) => {
  res.json({ message: "Server is running on port : 3000" });
});

app.listen(port, () =>
  console.log(`Server is running on port : http://localhost:${port}`)
);
