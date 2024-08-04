// components/CheckoutForm.js

import React, { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

export default function CheckoutForm({ clientSecret }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    })

    if (result.error) {
      setError(result.error.message)
    } else {
      if (result.paymentIntent.status === "succeeded") {
        console.log("Payment successful!")
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay"}
      </button>
      {error && <div role="alert">{error}</div>}
    </form>
  )
}
