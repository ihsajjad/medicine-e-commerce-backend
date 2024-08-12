import jwt from "jsonwebtoken";

export const generateRefreshToken = (userId: string, userRole: string) => {
  const token = jwt.sign(
    { userId, userRole },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "1d",
    }
  );

  return token;
};

export const generateAccessToken = (refreshToken: string) => {
  const token = jwt.sign(
    { refreshToken },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "1h",
    }
  );

  return token;
};
