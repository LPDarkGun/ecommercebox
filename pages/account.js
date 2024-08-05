// pages/account.js
import { useSession } from "next-auth/react"
import { useState } from "react"

const Account = () => {
  const { data: session, status } = useSession()
  const [portalUrl, setPortalUrl] = useState("")

  const fetchPortalSession = async () => {
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to create portal session")
      }

      const { url } = await response.json()
      setPortalUrl(url)
    } catch (error) {
      console.error("Error fetching portal session:", error)
    }
  }

  if (!session) {
    return <p>Please sign in to view your account details.</p>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Account Details</h1>
      <div>
        <p>
          Your subscription and billing details can be managed through the
          Stripe portal.
        </p>
        <button
          onClick={fetchPortalSession}
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4 inline-block"
        >
          Manage Subscription
        </button>
        {portalUrl && (
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white py-2 px-4 rounded mt-4 inline-block"
          >
            Go to Billing Portal
          </a>
        )}
      </div>
    </div>
  )
}

export default Account
