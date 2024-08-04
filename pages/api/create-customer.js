import stripe from "@/lib/stripe"

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email } = req.body
      const customer = await stripe.customers.create({
        email,
      })

      res.status(200).json({ customerId: customer.id })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
