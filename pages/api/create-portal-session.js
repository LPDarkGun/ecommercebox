// pages/api/create-portal-session.js
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { customerId } = req.body

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
      })

      res.status(200).json({ url: session.url })
    } catch (err) {
      console.error("Error creating portal session:", err)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method Not Allowed")
  }
}
