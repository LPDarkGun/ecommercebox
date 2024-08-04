import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Elements } from "@stripe/react-stripe-js"
import getStripe from "@/lib/stripe-client"
import CheckoutForm from "@/components/CheckoutForm"

const coolPhrases = [
  "Unleash the Power of Entertainment",
  "Your Gateway to Infinite Channels",
  "Redefine Your Viewing Experience",
  "The Future of TV is Here",
]

export default function Hero() {
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [clientSecret, setClientSecret] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % coolPhrases.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    // Create subscription on component mount and set clientSecret
    async function createSubscription() {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: "your-customer-id",
          priceId: "your-price-id",
        }),
      })

      const { clientSecret } = await response.json()
      setClientSecret(clientSecret)
    }

    createSubscription()
  }, [])

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

        {/* Section 1 */}
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
          className="flex flex-col lg:flex-row-reverse items-start"
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

        <Elements stripe={getStripe()}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </div>
    </div>
  )
}
