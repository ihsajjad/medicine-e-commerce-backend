import { Request, Response } from "express";
import { validationResult } from "express-validator";

export const signUp = (req: Request, res: Response) => {
  try {
    const userData = req.body;

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const photoURL = `${baseUrl}/api/users/photos/${req.file?.filename}`;

    console.log(req.file, photoURL);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ data: errors.array() });
    }

    res.json({ message: "Success" });
  } catch (error) {
    console.log(__filename, error);
  }
};
