import { mongoose, Schema } from "../utils/mongoose.js";
import enumCommon from "../constants/enumCommon.js"

const UserVerificationSchema = new Schema(
    {
        userId: {
            type: String,
        },
        uniqueString: { type: String },
        createdAt: { type: Date },
        expiresAt: { type: Date }
    }
);

export default mongoose.model("user_verify", UserVerificationSchema);
