import bcrypt from "bcryptjs"
import User from "@/models/User"
import { mongooseConnect } from "@/lib/mongoose"
import Stripe from "stripe"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export default async function handler(req, res) {
  const { method } = req
  await mongooseConnect()

  try {
    if (method === "POST") {
      const { name, email, phone, password } = req.body

      if (!email && !phone) {
        return res
          .status(400)
          .json({ error: "Email or phone number is required." })
      }

      const existingUser = await User.findOne({
        $or: [{ email: email?.toLowerCase() }, { phone }].filter(Boolean),
      })

      if (existingUser) {
        return res.status(400).json({
          error: "User with this email or phone number already exists.",
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const stripeCustomer = await stripe.customers.create({
        email: email?.toLowerCase() || undefined,
        phone,
        name,
      })

      const userDoc = await User.create({
        name,
        email: email ? email.toLowerCase() : undefined,
        phone: phone || undefined,
        password: hashedPassword,
        stripeCustomerId: stripeCustomer.id,
      })

      return res.status(201).json({
        id: userDoc._id,
        name: userDoc.name,
        stripeCustomerId: userDoc.stripeCustomerId,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      })
    }

    if (method === "GET") {
      const { email, phone } = req.query

      if (!email && !phone) {
        return res
          .status(400)
          .json({ error: "Email or phone query parameter is required." })
      }

      const user = await User.findOne({
        $or: [{ email: email?.toLowerCase() }, { phone }].filter(Boolean),
      })

      if (!user) {
        return res.status(404).json({ error: "User not found." })
      }

      return res.status(200).json({
        id: user._id,
        name: user.name,
        stripeCustomerId: user.stripeCustomerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    }

    if (method === "DELETE") {
      const { email, phone } = req.query

      if (!email && !phone) {
        return res
          .status(400)
          .json({ error: "Email or phone query parameter is required." })
      }

      const user = await User.findOneAndDelete({
        $or: [{ email: email?.toLowerCase() }, { phone }].filter(Boolean),
      })

      if (!user) {
        return res.status(404).json({ error: "User not found." })
      }

      return res.status(200).json({ message: "User deleted successfully." })
    }
  } catch (error) {
    console.error("Error handling user request:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
