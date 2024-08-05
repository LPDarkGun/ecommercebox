import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { loadStripe } from "@stripe/stripe-js"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { signOut, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const coolPhrases = [
  "Unleash the Power of Entertainment",
  "Your Gateway to Infinite Channels",
  "Redefine Your Viewing Experience",
  "The Future of TV is Here",
]

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

export default function Hero() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    zipCode: "",
    state: "",
    country: "",
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % coolPhrases.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (session) {
        try {
          console.log(
            "Fetching subscription status for customerId:",
            session.user.customerId
          )
          const response = await fetch("/api/subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId: session.user.customerId }),
          })

          if (response.ok) {
            const data = await response.json()
            console.log("Subscription data:", data)
            setIsSubscribed(data.subscription?.status === "active")
          } else {
            console.error("Failed to fetch subscription:", response.statusText)
          }
        } catch (error) {
          console.error("Error fetching subscription status:", error)
        }
      }
    }

    fetchSubscriptionStatus()
  }, [session])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          phoneNumber: userInfo.phoneNumber,
          address: userInfo.address,
          zipCode: userInfo.zipCode,
          state: userInfo.state,
          country: userInfo.country,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create Stripe session")
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      const result = await stripe.redirectToCheckout({ sessionId })
      if (result.error) {
        console.error(result.error.message)
      }
    } catch (err) {
      console.error("Error during subscription:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <div className="container mx-auto py-16 px-4">
        <motion.header
          className="text-center mb-24"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
            Next-Gen TV Revolution
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPhrase}
              className="text-3xl font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {coolPhrases[currentPhrase]}
            </motion.p>
          </AnimatePresence>
        </motion.header>
        {/* Sections would go here */}
        <motion.div
          className="flex flex-col lg:flex-row items-start mb-32"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="lg:w-3/5 mb-12 lg:mb-0">
            <motion.img
              src="/bar.jpg"
              alt="Bar Image"
              className="w-full h-auto rounded-3xl shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="lg:w-2/5 lg:pl-16 text-start">
            <h2 className="text-5xl font-light mb-6">1000+ CHANNELS</h2>
            <p className="text-2xl mb-6">4-day archive for all channels</p>
            <motion.p className="text-6xl font-semibold text-pink-400">
              $1/month
              <button onClick={() => signOut()}>Sign out</button>
              <button onClick={() => signIn()}>Sign In</button>
            </motion.p>
          </div>
        </motion.div>
        {/* Section 2 */}
        <motion.div
          className="flex flex-col lg:flex-row-reverse items-start mb-32"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="lg:w-3/5 mb-12 lg:mb-0">
            <motion.img
              src="/arrow_film.jpg"
              alt="Arrow Film"
              className="w-full h-auto rounded-3xl shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="lg:w-2/5 lg:pr-16 text-start">
            <h2 className="text-5xl font-light mb-6">SD/HD CHANNELS</h2>
            <p className="text-2xl">Enjoy crystal-clear picture quality</p>
          </div>
        </motion.div>
        {/* Section 3 */}
        <motion.div
          className="flex flex-col lg:flex-row items-start mb-32"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="lg:w-3/5 mb-12 lg:mb-0">
            <motion.img
              src="/shedule.jpg"
              alt="Schedule"
              className="w-full h-auto rounded-3xl shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="lg:w-2/5 lg:pl-16 text-start">
            <h2 className="text-5xl font-light mb-6">TV GUIDE</h2>
            <p className="text-2xl">Never miss your favorite shows</p>
          </div>
        </motion.div>
        {/* Section 4 */}
        <motion.div
          className="flex flex-col lg:flex-row-reverse items-start mb-32"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="lg:w-3/5 mb-12 lg:mb-0">
            <motion.img
              src="/search.jpg"
              alt="Search"
              className="w-full h-auto rounded-3xl shadow-2xl mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="lg:w-2/5 lg:pr-16 text-start">
            <h2 className="text-5xl font-light mb-6">SMART SEARCH</h2>
            <p className="text-2xl">Find your perfect channel instantly</p>
          </div>
        </motion.div>
        {/* Subscription Section */}
        <motion.div
          className="flex flex-col items-center justify-center py-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          {status === "authenticated" ? (
            isSubscribed ? (
              <div>
                <h2 className="text-4xl font-bold mb-4">You are subscribed!</h2>
                <Button>
                  <Link href="/account">Manage Your Subscription</Link>
                </Button>
              </div>
            ) : (
              <div>
                <h2 className="text-4xl font-bold mb-4">Subscribe Now</h2>
                <form className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={userInfo.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={userInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code"
                    value={userInfo.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={userInfo.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={userInfo.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </form>
                <Button onClick={handleSubscribe} disabled={loading}>
                  {loading ? "Processing..." : "Subscribe for $1/month"}
                </Button>
              </div>
            )
          ) : (
            <p className="text-2xl">Please sign in to subscribe.</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
