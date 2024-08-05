import { buffer } from "micro"
import Stripe from "stripe"
import { mongooseConnect } from "@/lib/mongoose"
import Order from "@/models/Order"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
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

  let rawBody
  try {
    rawBody = await buffer(req)
    console.log("Raw body received:", rawBody.toString())
  } catch (err) {
    console.error("Error reading raw body:", err)
    return res.status(500).send("Failed to read request body")
  }

  const signature = req.headers["stripe-signature"]
  console.log("Received webhook. Signature:", signature)
  console.log("Headers:", req.headers)

  let event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log("Webhook verified. Event type:", event.type)
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    await mongooseConnect()
    console.log("MongoDB connection successful")

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object
        console.log(`Processing subscription ${subscription.id}`)
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
    console.error(`Error processing webhook:`, error)
    return res.status(500).json({ error: "Internal server error" })
  }

  res.status(200).json({ received: true })
}

export default webhookHandler
