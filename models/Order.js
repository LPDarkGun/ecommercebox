// models/Order.js
import { model, models, Schema } from "mongoose"

const orderSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    line_items: { type: Array, required: true },
    paid: { type: Boolean, default: false },
    // New fields for subscription management
    subscription: {
      id: { type: String, default: null },
      status: { type: String, default: null },
      customerId: { type: String, default: null },
    },
  },
  { timestamps: true }
)

const Order = models.Order || model("Order", orderSchema)
export default Order
