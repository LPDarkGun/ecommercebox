// pages/api/subscription-details.js
import Stripe from "stripe"
import { getToken } from "next-auth/jwt"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.setHeader("Allow", ["GET"]).status(405).end("Method Not Allowed")
  }

  const { session_id } = req.query

  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id parameter" })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    )

    const subscriptionDetails = {
      plan: subscription.plan.nickname || "Standard Plan",
      status: subscription.status,
      amount: subscription.plan.amount,
      nextBillingDate: new Date(
        subscription.current_period_end * 1000
      ).toLocaleDateString(),
    }

    res.status(200).json(subscriptionDetails)
  } catch (error) {
    console.error("Error fetching subscription details:", error)
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message })
  }
}
