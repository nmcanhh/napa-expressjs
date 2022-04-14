import { mongoose, Schema } from "../utils/mongoose.js";
import enumCommon from "../constants/enumCommon.js"

const UserSchema = new Schema(
  {
    email: {
      type: String,
    },
    password: { type: String },
    status: {
      type: Number,
      enum: [enumCommon.userStatus.inactive, enumCommon.userStatus.active],
      default: enumCommon.userStatus.inactive,
    },
    profilePhoto: { type: String },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    fullName: { type: String, default: null },
    googleId: { type: String, default: null },
    githubId: { type: String, default: null },
    role: {
      type: Number,
    },
    verified: { type: Boolean },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model("users", UserSchema);
