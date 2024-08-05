// pages/api/create-portal-session.js
import Stripe from "stripe"
import { getSession } from "next-auth/react"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .setHeader("Allow", ["POST"])
      .status(405)
      .end("Method Not Allowed")
  }

  // Get user session
  const session = await getSession({ req })

  if (!session || !session.user.customerId) {
    return res
      .status(403)
      .json({ error: "User is not authenticated or has no customer ID." })
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: session.user.customerId,
      return_url: `${req.headers.origin}/account`, // The URL the customer will be redirected to after managing billing
    })

    res.status(200).json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
