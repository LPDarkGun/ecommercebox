// pages/api/webhooks.js
import { buffer } from "micro"
import Stripe from "stripe"
import { mongooseConnect } from "@/lib/mongoose"
import Order from "@/models/Order"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export const config = {
  api: {
    bodyParser: false, // Disable the body parser for raw request handling
  },
}

const webhookHandler = async (req, res) => {
  await mongooseConnect() // Ensure the database connection

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).end("Method Not Allowed")
  }

  // Retrieve the raw body to verify the event's signature
  const buf = await buffer(req)
  const sig = req.headers["stripe-signature"]

  let event

  try {
    // Construct the event using the raw body and signature
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // Replace with your webhook secret
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object
      // Log the subscription details for debugging
      console.log(
        "Processing subscription event for customer:",
        subscription.customer
      )

      // Update the subscription details in the database
      try {
        const updateResult = await Order.updateOne(
          { "subscription.customerId": subscription.customer },
          {
            $set: {
              "subscription.id": subscription.id,
              "subscription.status": subscription.status,
              paid: subscription.status === "active",
            },
          }
        )
        console.log("Subscription updated:", updateResult)
      } catch (error) {
        console.error("Error updating subscription in database:", error)
      }

      break

    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true })
}

export default webhookHandler
