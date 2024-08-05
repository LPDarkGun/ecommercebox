import { useSession } from "next-auth/react"
import { useState } from "react"
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
import {
  Loader2,
  User,
  CreditCard,
  Home,
  Calendar,
  Package,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { LogIn } from "lucide-react"

const Account = () => {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchPortalSession = async () => {
    setLoading(true)
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
      window.location.href = url // Redirect in the same tab
    } catch (error) {
      console.error("Error fetching portal session:", error)
      toast({
        title: "Error",
        description: "Failed to load the management portal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Loading account details...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white text-center">
                Welcome
              </CardTitle>
              <CardDescription className="text-purple-200 text-center">
                Access your account to manage your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-gray-300">
                Please sign in to view your account details and manage your
                subscription.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <Button
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700 transition-colors duration-300"
                >
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Homepage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className=" mx-auto py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarImage src={session.user.image} alt={session.user.name} />
                <AvatarFallback className="text-2xl text-black">
                  {session.user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-4xl font-bold">
                  Welcome, {session.user.name}
                </CardTitle>
                <CardDescription className="text-purple-100">
                  {session.user.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-6 space-y-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="mr-2" />
                  Personal Info
                </h3>
                <p>{session.user.name}</p>
                <p>{session.user.email}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Package className="mr-2" />
                  Subscription Details
                </h3>
                <div className="flex items-center space-x-2">
                  <span>Plan:</span>
                  <Badge variant="secondary">Standard Plan</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="mr-1" />
                  <span>Next Billing Date: 9/5/2024</span>
                </div>
              </div>
            </motion.div>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <CreditCard className="mr-2" />
                Billing Management
              </h3>
              <p className="text-sm text-gray-500">
                Manage your subscription and billing details through our secure
                Stripe portal.
              </p>
              <div className="flex space-x-4">
                <Button onClick={fetchPortalSession} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Manage Subscription"
                  )}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Account
