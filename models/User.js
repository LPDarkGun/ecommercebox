import { model, models, Schema } from "mongoose"

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

const User = models.User || model("User", userSchema)
export default User
