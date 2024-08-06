import { model, models, Schema } from "mongoose"

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      required: function () {
        return !this.phone // Email is required if phone is not provided
      },
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return !this.email // Phone is required if email is not provided
      },
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
