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

    if (!clientSecret) {
      setError("Payment initiation failed. Please try again.")
      setLoading(false)
      return
    }

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
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md"
    >
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="card-element"
        >
          Credit or Debit Card
        </label>
        <div className="p-3 border border-gray-300 rounded-lg">
          <CardElement id="card-element" className="bg-transparent" />
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
        }`}
      >
        {loading ? "Processing..." : "Pay"}
      </button>
      {error && (
        <div role="alert" className="mt-4 text-red-600">
          {error}
        </div>
      )}
    </form>
  )
}
