import { ObjectId } from "mongoose";

export type UserDataType = {
  id: ObjectId;
  name: string;
  email: string;
  password: string;
  photo: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};
