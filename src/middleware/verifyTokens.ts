import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { UserDataType } from "../lib/types";
import { base64ToDecode, generateAccessToken } from "../lib/utils";
import User from "../models/users.model";

declare global {
  namespace Express {
    interface Request {
      userEmail: string;
      userRole: string;
      userId: string;
    }
  }
}

export const verifyTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = (await req.cookies["accessToken"]) || "";

  const hashedUserId = await req.cookies["userId"];
  if (!hashedUserId)
    return res
      .status(401)
      .json({ message: "Unauthorized access please login" });

  const userId = base64ToDecode(hashedUserId);

  // verifing the accessToken
  return jwt.verify(
    accessToken,
    process.env.JWT_ACCESS_SECRET_KEY as string,
    async (
      accessError: VerifyErrors | null,
      decodedAccessToken: JwtPayload | string | undefined
    ) => {
      // if the access token is expired then create one
      if (accessError) {
        const user = (await User.findById(userId)) as UserDataType;
        const refreshToken = user.refreshToken as string;

        try {
          // checking the refreshToken is valid or not
          const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET_KEY as string
          );

          const email = await (decodedRefreshToken as JwtPayload)?.email;
          const role = await (decodedRefreshToken as JwtPayload)?.role;
          req.userEmail = email;
          req.userRole = role;
          req.userId = userId;

          // Refresh token is valid. Generate and set new accessToken
          const accessToken = generateAccessToken(email, role);
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(Date.now() + 3600000),
          });

          next();
        } catch (error) {
          // refresh token is not valid so ask for the login again
          return res
            .status(403)
            .json({ message: "Expired refresh token. login again!" });
        }
      }

      // Extract data from the valid accessToken, set them for authorization and call next fn
      if (decodedAccessToken) {
        const email = await (decodedAccessToken as JwtPayload)?.email;
        const role = await (decodedAccessToken as JwtPayload)?.role;
        req.userEmail = email;
        req.userRole = role;
        req.userId = userId;

        next();
      }
    }
  );
};
