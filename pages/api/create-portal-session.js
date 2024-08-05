// pages/api/create-portal-session.js
import Stripe from "stripe"
import { getToken } from "next-auth/jwt"

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

  // Get user token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token || !token.customerId) {
    return res
      .status(403)
      .json({ error: "User is not authenticated or has no customer ID." })
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: token.customerId,
      return_url: `${req.headers.origin}/account`,
    })

    res.status(200).json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message })
  }
}
