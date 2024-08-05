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
    bodyParser: false,
  },
}

const webhookHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).end("Method Not Allowed")
  }

  let event

  try {
    const rawBody = await buffer(req)
    const signature = req.headers["stripe-signature"]

    event = stripe.webhooks.constructEvent(
      rawBody.toString(), // Convert buffer to string
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Connect to MongoDB only if the signature is verified
  await mongooseConnect()

  // Handle the event
  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object
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
        console.log(
          `Subscription ${subscription.id} updated. Result:`,
          updateResult
        )
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`)
    return res.status(500).json({ error: "Internal server error" })
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true })
}

export default webhookHandler
