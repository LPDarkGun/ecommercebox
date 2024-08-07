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
      const { name, email, password } = req.body

      if (!email) {
        return res.status(400).json({ error: "Email is required." })
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      })

      if (existingUser) {
        return res.status(400).json({
          error: "User with this email already exists.",
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const stripeCustomer = await stripe.customers.create({
        email: email.toLowerCase(),
        name,
      })

      const userDoc = await User.create({
        name,
        email: email.toLowerCase(),
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
      const { email } = req.query

      if (!email) {
        return res
          .status(400)
          .json({ error: "Email query parameter is required." })
      }

      const user = await User.findOne({
        email: email.toLowerCase(),
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
      const { email } = req.query

      if (!email) {
        return res
          .status(400)
          .json({ error: "Email query parameter is required." })
      }

      const user = await User.findOneAndDelete({
        email: email.toLowerCase(),
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
