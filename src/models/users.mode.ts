import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
import { UserDataType } from "../lib/types";

const userSchema = new Schema<UserDataType>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["Super Admin", "Admin", "User"],
    default: "User",
  },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
});

// hashing the password before storing to the database
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = model<UserDataType>("user", userSchema);
export default User;
