// pages/api/webhook.js

import stripe from "@/lib/stripe"

export default async function handler(req, res) {
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
    console.log(`⚠️  Webhook signature verification failed: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case "invoice.payment_succeeded":
      const paymentIntent = event.data.object
      console.log("PaymentIntent was successful!")
      break
    case "invoice.payment_failed":
      const paymentFailedIntent = event.data.object
      console.log("Payment failed!")
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.status(200).end()
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}
