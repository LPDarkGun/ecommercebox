import { buffer } from "micro"
import Stripe from "stripe"
import { mongooseConnect } from "@/lib/mongoose"
import Order from "@/models/Order"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const webhookHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).end("Method Not Allowed")
  }

  let rawBody
  try {
    rawBody = await buffer(req)
  } catch (err) {
    console.error("Error reading raw body:", err)
    return res.status(500).send("Failed to read request body")
  }

  const signature = req.headers["stripe-signature"]

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    await mongooseConnect()

    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object
        console.log(`Subscription created: ${subscription.id}`)

        // Check if this is a non-renewing subscription based on the price ID
        const nonRenewingPriceIds = ["price_1PlHo2EgdqLNJO1L1Sjs0YMz"] // Your non-renewing price IDs

        if (
          subscription.items.data.some((item) =>
            nonRenewingPriceIds.includes(item.price.id)
          )
        ) {
          // Set subscription to cancel at the end of the current billing period
          await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
          })
          console.log(
            `Subscription set to cancel at period end: ${subscription.id}`
          )
        }

        // Update order in the database
        const updateResult = await Order.updateOne(
          { "subscription.customerId": subscription.customer },
          {
            $set: {
              "subscription.id": subscription.id,
              "subscription.status": subscription.status,
              paid: subscription.status === "active",
            },
          }
        )

        console.log(
          `Order updated for subscription creation. Result:`,
          updateResult
        )

        break
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object
        console.log(`Subscription updated: ${subscription.id}`)

        const updateResult = await Order.updateOne(
          { "subscription.id": subscription.id },
          {
            $set: {
              "subscription.status": subscription.status,
              paid: subscription.status === "active",
            },
          }
        )

        console.log(
          `Order updated for subscription update. Result:`,
          updateResult
        )

        break
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object
        console.log(`Subscription canceled: ${subscription.id}`)

        const updateResult = await Order.updateOne(
          { "subscription.id": subscription.id },
          {
            $set: {
              "subscription.status": "canceled",
              paid: false,
            },
          }
        )

        console.log(
          `Order updated after subscription cancellation. Result:`,
          updateResult
        )

        break
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object
        console.log(`Invoice payment succeeded for ${invoice.id}`)

        const updateResult = await Order.updateOne(
          { "subscription.id": invoice.subscription },
          {
            $set: {
              paid: true,
            },
          }
        )

        console.log(`Order updated after payment. Result:`, updateResult)

        break
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object
        console.log(`Invoice payment failed for ${invoice.id}`)

        const updateResult = await Order.updateOne(
          { "subscription.id": invoice.subscription },
          {
            $set: {
              paid: false,
            },
          }
        )

        console.log(`Order updated after failed payment. Result:`, updateResult)

        break
      }
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return res.status(500).json({ error: "Internal server error" })
  }

  res.status(200).json({ received: true })
}

export default webhookHandler

// import { buffer } from "micro"
// import Stripe from "stripe"
// import { mongooseConnect } from "@/lib/mongoose"
// import Order from "@/models/Order"

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-08-16",
// })

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }
// const webhookHandler = async (req, res) => {
//   if (req.method !== "POST") {
//     res.setHeader("Allow", "POST")
//     return res.status(405).end("Method Not Allowed")
//   }

//   let rawBody
//   try {
//     rawBody = await buffer(req)
//   } catch (err) {
//     console.error("Error reading raw body:", err)
//     return res.status(500).send("Failed to read request body")
//   }

//   const signature = req.headers["stripe-signature"]

//   let event
//   try {
//     event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     )
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message)
//     return res.status(400).send(`Webhook Error: ${err.message}`)
//   }

//   try {
//     await mongooseConnect()

//     switch (event.type) {
//       case "customer.subscription.created": {
//         const subscription = event.data.object
//         console.log(`Subscription created: ${subscription.id}`)

//         // Update order in the database
//         const updateResult = await Order.updateOne(
//           { "subscription.customerId": subscription.customer },
//           {
//             $set: {
//               "subscription.id": subscription.id,
//               "subscription.status": subscription.status,
//               paid: subscription.status === "active",
//             },
//           }
//         )

//         console.log(
//           `Order updated for subscription creation. Result:`,
//           updateResult
//         )

//         break
//       }
//       case "customer.subscription.deleted": {
//         const subscription = event.data.object
//         console.log(`Subscription canceled: ${subscription.id}`)

//         const updateResult = await Order.updateOne(
//           { "subscription.id": subscription.id },
//           {
//             $set: {
//               "subscription.status": "canceled",
//               paid: false,
//             },
//           }
//         )

//         console.log(
//           `Order updated after subscription cancellation. Result:`,
//           updateResult
//         )

//         break
//       }
//       case "invoice.payment_succeeded": {
//         const invoice = event.data.object
//         console.log(`Invoice payment succeeded for ${invoice.id}`)

//         const updateResult = await Order.updateOne(
//           { "subscription.id": invoice.subscription },
//           {
//             $set: {
//               paid: true,
//             },
//           }
//         )

//         console.log(`Order updated after payment. Result:`, updateResult)

//         // Note: Stripe sends the receipt automatically if enabled in settings

//         break
//       }
//       case "invoice.payment_failed": {
//         const invoice = event.data.object
//         console.log(`Invoice payment failed for ${invoice.id}`)

//         const updateResult = await Order.updateOne(
//           { "subscription.id": invoice.subscription },
//           {
//             $set: {
//               paid: false,
//             },
//           }
//         )

//         console.log(`Order updated after failed payment. Result:`, updateResult)

//         break
//       }
//       default:
//         console.log(`Unhandled event type ${event.type}`)
//     }
//   } catch (error) {
//     console.error("Error processing webhook:", error)
//     return res.status(500).json({ error: "Internal server error" })
//   }

//   res.status(200).json({ received: true })
// }

// export default webhookHandler
