// pages/api/subscription.js
import { mongooseConnect } from "@/lib/mongoose"
import Order from "@/models/Order"

export default async function handler(req, res) {
  await mongooseConnect()

  if (req.method === "POST") {
    const { customerId } = req.body

    try {
      const order = await Order.findOne({
        "subscription.customerId": customerId,
      })

      if (order) {
        res.status(200).json({ subscription: order.subscription })
      } else {
        res.status(404).json({ error: "Subscription not found" })
      }
    } catch (err) {
      console.error("Error fetching subscription:", err)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method Not Allowed")
  }
}
