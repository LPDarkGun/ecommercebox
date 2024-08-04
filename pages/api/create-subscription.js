// pages/api/create-subscription.js

import stripe from "@/lib/stripe"

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { customerId, priceId } = req.body

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      })

      res.status(200).json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
