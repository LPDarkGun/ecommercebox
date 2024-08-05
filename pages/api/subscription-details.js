// pages/api/subscription-details.js
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export default async function handler(req, res) {
  const { session_id } = req.query

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id)

    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    )

    // Extract relevant information
    const subscriptionDetails = {
      plan: subscription.plan.nickname,
      status: subscription.status,
      amount: subscription.plan.amount,
      nextBillingDate: new Date(
        subscription.current_period_end * 1000
      ).toLocaleDateString(),
    }

    res.status(200).json(subscriptionDetails)
  } catch (err) {
    console.error("Error fetching subscription details:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
