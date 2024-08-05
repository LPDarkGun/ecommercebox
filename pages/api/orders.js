// pages/api/orders.js
import Order from "@/models/Order" // Import your Order model
import { mongooseConnect } from "@/lib/mongoose" // Function to connect to MongoDB
import Stripe from "stripe"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export default async function handler(req, res) {
  await mongooseConnect() // Ensure database connection

  if (req.method === "POST") {
    const { name, email, phoneNumber, address, zipCode, state, country } =
      req.body

    try {
      // Step 1: Create a new Stripe customer if not already existing
      const customer = await stripe.customers.create({
        name,
        email,
        phone: phoneNumber,
        address: {
          line1: address,
          postal_code: zipCode,
          state,
          country,
        },
      })

      // Step 2: Create a checkout session for a subscription
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: "price_1Pk2OjLElu582MHu7IE8OzNn", // Replace with your actual Stripe price ID
            quantity: 1,
          },
        ],
        customer: customer.id, // Link session to the created customer
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
      })

      // Step 3: Save order with subscription details in the database
      const order = await Order.create({
        name,
        email,
        phoneNumber,
        address,
        zipCode,
        state,
        country,
        line_items: [{ price: "price_1Pk2OjLElu582MHu7IE8OzNn", quantity: 1 }],
        paid: false,
        subscription: {
          id: null, // Will be updated when subscription is activated
          status: "pending", // Initial status
          customerId: customer.id, // Store the Stripe customer ID
        },
      })

      // Step 4: Respond with the session ID to the client
      res.status(200).json({ sessionId: session.id })
    } catch (err) {
      console.error("Error creating order:", err)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method Not Allowed")
  }
}
