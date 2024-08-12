import mongoose from "mongoose";
import { VerificationCodeType } from "../lib/types";

const codeSchema = new mongoose.Schema<VerificationCodeType>({
  code: { type: Number, required: true },
  email: { type: String, required: true },
});

const Code = mongoose.model<VerificationCodeType>("Code", codeSchema);

export default Code;
