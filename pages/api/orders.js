import { getToken } from "next-auth/jwt"
import Order from "@/models/Order"
import { mongooseConnect } from "@/lib/mongoose"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export default async function handler(req, res) {
  await mongooseConnect()

  // Get the token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (req.method === "POST") {
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const {
      name,
      email,
      phoneNumber,
      address,
      zipCode,
      state,
      country,
      customerId,
    } = req.body

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" })
    }

    try {
      // Create a checkout session for a subscription
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: "price_1Pk2OjLElu582MHu7IE8OzNn", // Replace with your actual Stripe price ID
            quantity: 1,
          },
        ],
        customer: customerId,
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
      })

      // Save order with subscription details in the database
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
          id: null,
          status: "pending",
          customerId: customerId,
        },
      })

      res
        .status(200)
        .json({ sessionId: checkoutSession.id, customerId: customerId })
    } catch (err) {
      console.error("Error creating order:", err)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else if (req.method === "GET") {
    const { customerId } = req.query

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" })
    }

    try {
      // Retrieve the order by customerId
      const order = await Order.findOne({
        "subscription.customerId": customerId,
      })

      if (!order) {
        return res.status(404).json({ error: "Order not found" })
      }

      // Respond with the order and subscription details
      res.status(200).json({
        subscriptionId: order.subscription.id,
        subscriptionStatus: order.subscription.status,
        customerId: order.subscription.customerId,
        paid: order.paid,
      })
    } catch (error) {
      console.error("Error fetching order:", error)
      res.status(500).json({ error: "Failed to fetch order" })
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"])
    res.status(405).end("Method Not Allowed")
  }
}
