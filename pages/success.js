import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"

export default function Success() {
  const router = useRouter()
  const [subscriptionDetails, setSubscriptionDetails] = useState(null)

  useEffect(() => {
    // Extract the session ID from the URL
    const { session_id } = router.query

    // Fetch subscription details from the server using the session ID
    const fetchSubscriptionDetails = async () => {
      if (session_id) {
        const response = await fetch(
          `/api/subscription-details?session_id=${session_id}`
        )
        const data = await response.json()
        setSubscriptionDetails(data)
      }
    }

    fetchSubscriptionDetails()
  }, [router.query])

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
