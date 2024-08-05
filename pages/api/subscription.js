// pages/api/subscription.js
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { customerId } = req.body

  try {
    // Fetch all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method"],
    })

    if (subscriptions.data.length === 0) {
      return res.status(200).json({ subscription: null })
    }

    // Assuming we're only interested in the first active subscription
    const subscription = subscriptions.data.find(
      (sub) => sub.status === "active"
    )

    return res.status(200).json({
      subscription: subscription || null,
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return res.status(500).json({ error: "Failed to fetch subscription" })
  }
}
