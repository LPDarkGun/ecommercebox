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

// Helper function to read the raw body
const getRawBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk.toString()
    })
    req.on("end", () => {
      resolve(body)
    })
    req.on("error", reject)
  })
}

const webhookHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).end("Method Not Allowed")
  }

  const rawBody = await getRawBody(req)
  const signature = req.headers["stripe-signature"]

  console.log("Received webhook. Signature:", signature)

  let event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log("Webhook verified. Event type:", event.type)

  try {
    await mongooseConnect()
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    return res.status(500).send("Database connection failed")
  }

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
    console.error("Error processing webhook:", error)
    return res.status(500).json({ error: "Internal server error" })
  }

  res.status(200).json({ received: true })
}

export default webhookHandler
