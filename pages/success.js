import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mt-56 mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-green-600 dark:text-green-400">
              <CheckCircle className="inline-block mr-2" />
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-center mt-2">
              Thank you for your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionDetails ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  Subscription Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <strong>Plan:</strong>
                    <Badge variant="secondary">
                      {subscriptionDetails.plan}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <strong>Status:</strong>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      {subscriptionDetails.status}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <strong>Amount Paid:</strong>
                    <span className="text-lg font-semibold">
                      ${subscriptionDetails.amount / 100}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <strong>Next Billing Date:</strong>
                    <span>{subscriptionDetails.nextBillingDate}</span>
                  </div>
                </div>
                <div className="mt-8 flex justify-center space-x-4">
                  <Button asChild>
                    <Link href="/account">Manage Your Subscription</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/">Go to Homepage</Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2">Loading subscription details...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
