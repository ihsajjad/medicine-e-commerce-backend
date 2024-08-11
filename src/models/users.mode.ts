import { model, Schema } from "mongoose";
import { UserDataType } from "../lib/shared";

const userSchema = new Schema<UserDataType>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["Super Admin", "Admin", "User"],
  },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

const User = model<UserDataType>("user", userSchema);
export default User;
