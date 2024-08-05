// pages/account.js
import { useSession } from "next-auth/react"

const Account = () => {
  const { data: session, status } = useSession()

  // Base Stripe Customer Portal link
  const customerPortalBaseLink =
    "https://billing.stripe.com/p/login/test_dR6aGCfNg7NFe6Q3cc"

  // Construct the full link with the prefilled email
  const customerPortalLink = `${customerPortalBaseLink}?prefilled_email=${encodeURIComponent(
    session?.user?.email || ""
  )}`

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
        <a
          href={customerPortalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4 inline-block"
        >
          Manage Subscription
        </a>
      </div>
    </div>
  )
}

export default Account
