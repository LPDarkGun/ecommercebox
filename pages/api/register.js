// pages/api/register.js
import bcrypt from "bcryptjs"
import User from "@/models/User" // Import the User model
import { mongooseConnect } from "@/lib/mongoose" // Function to connect to MongoDB
import Stripe from "stripe"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export default async function handler(req, res) {
  // Extract the HTTP method from the request
  const { method } = req
  await mongooseConnect() // Ensure a connection to the database

  try {
    if (method === "POST") {
      const { name, email, password } = req.body

      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { name }],
      })

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with this email or name already exists." })
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
        stripeCustomerId: stripeCustomer.id, // Ensure this is saved
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
        // Respond with an error if the email query parameter is missing
        return res
          .status(400)
          .json({ error: "Email query parameter is required." })
      }

      // Find the user by email
      const user = await User.findOne({ email: email.toLowerCase() })

      if (!user) {
        // Respond with an error if the user is not found
        return res.status(404).json({ error: "User not found." })
      }

      // Respond with the user information
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
        // Respond with an error if the email query parameter is missing
        return res
          .status(400)
          .json({ error: "Email query parameter is required." })
      }

      // Find and delete the user by email
      const user = await User.findOneAndDelete({ email: email.toLowerCase() })

      if (!user) {
        // Respond with an error if the user is not found
        return res.status(404).json({ error: "User not found." })
      }

      // Respond with a success message upon successful deletion
      return res.status(200).json({ message: "User deleted successfully." })
    }

    // Respond with a 405 error if the method is not allowed
    return res.status(405).json({ error: "Method Not Allowed" })
  } catch (error) {
    // Log and respond with a 500 error in case of an exception
    console.error("Error handling user request:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
