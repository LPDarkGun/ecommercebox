import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"

export default function Success() {
  const router = useRouter()
  const [subscriptionDetails, setSubscriptionDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const { session_id } = router.query

    const fetchSubscriptionDetails = async () => {
      if (session_id) {
        try {
          const response = await fetch(
            `/api/subscription-details?session_id=${session_id}`
          )
          if (!response.ok) {
            throw new Error("Failed to fetch subscription details")
          }
          const data = await response.json()
          setSubscriptionDetails(data)
        } catch (err) {
          console.error("Error fetching subscription details:", err)
          setError(err.message)
        }
      }
    }

    fetchSubscriptionDetails()
  }, [router.query])

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Payment Successful!
      </h1>

      {subscriptionDetails ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Subscription Details</h2>
          <p>
            <strong>Plan:</strong> {subscriptionDetails.plan}
          </p>
          <p>
            <strong>Status:</strong> {subscriptionDetails.status}
          </p>
          <p>
            <strong>Amount Paid:</strong> ${subscriptionDetails.amount / 100}
          </p>
          <p>
            <strong>Next Billing Date:</strong>{" "}
            {subscriptionDetails.nextBillingDate}
          </p>
          <div className="mt-8">
            <a href="/account" className="text-blue-500 hover:underline">
              Manage Your Subscription
            </a>
            <span className="mx-2">|</span>
            <a href="/" className="text-blue-500 hover:underline">
              Go to Homepage
            </a>
          </div>
        </div>
      ) : (
        <p className="text-center">Loading subscription details...</p>
      )}
    </div>
  )
}
