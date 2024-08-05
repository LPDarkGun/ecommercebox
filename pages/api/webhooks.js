// pages/api/webhook.js
import { buffer } from "micro"
import Stripe from "stripe"
import { mongooseConnect } from "@/lib/mongoose"
import Order from "@/models/Order"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const webhookHandler = async (req, res) => {
  await mongooseConnect()

  if (req.method === "POST") {
    const buf = await buffer(req)
    const sig = req.headers["stripe-signature"]

    let event

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object
        // Update order based on subscription status
        await Order.updateOne(
          { "subscription.customerId": subscription.customer },
          {
            $set: {
              "subscription.id": subscription.id,
              "subscription.status": subscription.status,
              paid: subscription.status === "active",
            },
          }
        )
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method Not Allowed")
  }
}

export default webhookHandler
