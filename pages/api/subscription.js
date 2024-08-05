// pages/api/get-subscription.js
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { customerId } = req.query

  if (!customerId) {
    return res.status(400).json({ error: "Customer ID is required" })
  }

  try {
    // List all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method"],
    })

    if (subscriptions.data.length === 0) {
      return res.status(200).json({ subscription: null })
    }

    // Assuming you want the active subscription or the most recent
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active"
    )

    res.status(200).json({ subscription: activeSubscription || null })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    res.status(500).json({ error: "Failed to fetch subscription" })
  }
}
