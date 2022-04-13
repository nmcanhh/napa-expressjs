import { mongoose, Schema } from "../utils/mongoose.js";

export const userStatus = {
  inactive: "inactive",
  active: "active",
};

const UserSchema = new Schema(
  {
    username: {
      type: String,
    },
    password: { type: String },
    status: {
      type: String,
      enum: [userStatus.inactive, userStatus.active],
      default: userStatus.inactive,
    },
    profilePhoto: { type: String },
    email: { type: String },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    fullName: { type: String, default: null },
    googleId: { type: String, default: null },
    githubId: { type: String, default: null },
    role: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model("users", UserSchema);
