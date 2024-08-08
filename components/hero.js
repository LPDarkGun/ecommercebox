// components/hero.js

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { loadStripe } from "@stripe/stripe-js"
import { useSession } from "next-auth/react"
import { signOut, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const coolPhrases = [
  "Unleash the Power of Entertainment",
  "Your Gateway to Infinite Channels",
  "Redefine Your Viewing Experience",
  "The Future of TV is Here",
]

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

export default function Hero() {
  const { data: session, status } = useSession()
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState(null)

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    zipCode: "",
    state: "",
    country: "",
  })

  const [selectedProduct, setSelectedProduct] = useState("basic")

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % coolPhrases.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!session?.user?.customerId) return

      try {
        const response = await fetch(
          `/api/orders?customerId=${session.user.customerId}`
        )
        if (response.ok) {
          const data = await response.json()
          setIsSubscribed(data.subscriptionStatus === "active")
        } else {
          console.error("Failed to fetch subscription:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error)
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
    setError(null)
    try {
      if (!session) {
        throw new Error("Please sign in to subscribe")
      }

      const priceId = {
        basic: "price_1Pl1R9EgdqLNJO1L0Uco30CN", // Auto-renewing
        yearly1time: "price_1PlHo2EgdqLNJO1L1Sjs0YMz", // Non-renewing
      }[selectedProduct]

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userInfo,
          customerId: session.user.customerId,
          priceId, // Send the correct priceId to the backend
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create Stripe session")
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      const result = await stripe.redirectToCheckout({ sessionId })
      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (err) {
      console.error("Error during subscription:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      <div className="container mx-auto py-16 px-4">
        <motion.header
          className="text-center mb-24"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Experience the Best in TV Service
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPhrase}
              className="text-2xl md:text-4xl font-light text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {coolPhrases[currentPhrase]}
            </motion.p>
          </AnimatePresence>
          <motion.div
            className="mt-20 gap-4 flex flex-col sm:flex-row w-full justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {session ? (
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="w-full sm:w-auto bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700 py-2 px-4 text-lg"
              >
                Sign out
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="w-full sm:w-auto bg-purple-700 hover:bg-purple-600 text-white py-2 px-4 text-lg"
                onClick={() => signIn()}
              >
                Sign in
              </Button>
            )}
          </motion.div>
          {session?.user?.name && (
            <motion.p
              className="text-4xl md:text-6xl font-semibold text-purple-400 mt-8"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Welcome, {session.user.name}!
            </motion.p>
          )}
        </motion.header>

        {status === "authenticated" && (
          <motion.div
            className="flex flex-col lg:flex-row items-center justify-center mb-32"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.img
              src="/5.jpg"
              alt="Bar Image"
              className="w-full max-w-6xl h-auto rounded-3xl shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
        <motion.div
          className="flex flex-col items-center justify-center py-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          {status === "authenticated" ? (
            isSubscribed ? (
              <Card className="w-full max-w-3xl bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center text-purple-400">
                    You're Subscribed!
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button
                    variant="outline"
                    className="bg-gray-700 text-gray-200 hover:bg-gray-600"
                  >
                    <Link href="/account">Manage Your Subscription</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-3xl bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center text-purple-400">
                    Subscribe Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <Input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={userInfo.name}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
                    />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={userInfo.email}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
                    />
                    <Input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={userInfo.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
                    />
                    <Input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={userInfo.address}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        name="zipCode"
                        placeholder="Zip Code"
                        value={userInfo.zipCode}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
                      />
                      <Input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={userInfo.state}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
                      />
                    </div>
                    <Input
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={userInfo.country}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
                    />
                    <Select
                      value={selectedProduct}
                      onValueChange={(value) => setSelectedProduct(value)}
                    >
                      <SelectTrigger className="bg-gray-700 text-gray-200 border-gray-600">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-gray-200 border-gray-600">
                        <SelectItem value="basic">Basic - $15/month</SelectItem>
                        <SelectItem value="yearly1time">
                          1 time - $180 for 1 year
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </form>
                  <Button
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleSubscribe}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                  {error && (
                    <Alert
                      variant="destructive"
                      className="mt-4 bg-red-900 border-red-700 text-red-200"
                    >
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )
          ) : (
            <p className="text-3xl text-purple-400 font-light">
              Please sign in to subscribe.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// import React, { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { loadStripe } from "@stripe/stripe-js"
// import { useSession } from "next-auth/react"
// import { signOut, signIn } from "next-auth/react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import Link from "next/link"
// import { Loader2 } from "lucide-react"

// const coolPhrases = [
//   "Unleash the Power of Entertainment",
//   "Your Gateway to Infinite Channels",
//   "Redefine Your Viewing Experience",
//   "The Future of TV is Here",
// ]

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

// export default function Hero() {
//   const { data: session, status } = useSession()
//   const [currentPhrase, setCurrentPhrase] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [isSubscribed, setIsSubscribed] = useState(false)
//   const [error, setError] = useState(null)

//   const [userInfo, setUserInfo] = useState({
//     name: "",
//     email: "",
//     phoneNumber: "",
//     address: "",
//     zipCode: "",
//     state: "",
//     country: "",
//   })

//   const [selectedProduct, setSelectedProduct] = useState("basic")

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentPhrase((prev) => (prev + 1) % coolPhrases.length)
//     }, 4000)
//     return () => clearInterval(interval)
//   }, [])

//   useEffect(() => {
//     const fetchSubscriptionStatus = async () => {
//       if (!session?.user?.customerId) return

//       try {
//         const response = await fetch(
//           `/api/orders?customerId=${session.user.customerId}`
//         )
//         if (response.ok) {
//           const data = await response.json()
//           setIsSubscribed(data.subscriptionStatus === "active")
//         } else {
//           console.error("Failed to fetch subscription:", response.statusText)
//         }
//       } catch (error) {
//         console.error("Error fetching subscription status:", error)
//       }
//     }

//     fetchSubscriptionStatus()
//   }, [session])

//   const fadeIn = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 },
//   }

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setUserInfo((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubscribe = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       if (!session) {
//         throw new Error("Please sign in to subscribe")
//       }

//       const priceId = {
//         basic: "price_1Pl1R9EgdqLNJO1L0Uco30CN",
//         registration: "price_1PlHo2EgdqLNJO1L1Sjs0YMz",
//       }[selectedProduct]

//       const response = await fetch("/api/orders", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...userInfo,
//           customerId: session.user.customerId,
//           priceId,
//         }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Failed to create Stripe session")
//       }

//       const { sessionId } = await response.json()
//       const stripe = await stripePromise

//       const result = await stripe.redirectToCheckout({ sessionId })
//       if (result.error) {
//         throw new Error(result.error.message)
//       }
//     } catch (err) {
//       console.error("Error during subscription:", err.message)
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200">
//       <div className="container mx-auto py-16 px-4">
//         <motion.header
//           className="text-center mb-24"
//           initial="hidden"
//           animate="visible"
//           variants={fadeIn}
//           transition={{ duration: 0.8 }}
//         >
//           <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
//             Experience the Best in TV Service
//           </h1>
//           <AnimatePresence mode="wait">
//             <motion.p
//               key={currentPhrase}
//               className="text-2xl md:text-4xl font-light text-gray-300"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.5 }}
//             >
//               {coolPhrases[currentPhrase]}
//             </motion.p>
//           </AnimatePresence>
//           <motion.div
//             className="mt-20 gap-4 flex flex-col sm:flex-row w-full justify-center items-center"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5, duration: 0.5 }}
//           >
//             {session ? (
//               <Button
//                 variant="outline"
//                 onClick={() => signOut()}
//                 className="w-full sm:w-auto bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700 py-2 px-4 text-lg"
//               >
//                 Sign out
//               </Button>
//             ) : (
//               <Button
//                 variant="secondary"
//                 className="w-full sm:w-auto bg-purple-700 hover:bg-purple-600 text-white py-2 px-4 text-lg"
//                 onClick={() => signIn()}
//               >
//                 Sign in
//               </Button>
//             )}
//           </motion.div>
//           {session?.user?.name && (
//             <motion.p
//               className="text-4xl md:text-6xl font-semibold text-purple-400 mt-8"
//               initial={{ opacity: 0, scale: 0.5 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.5, delay: 0.7 }}
//             >
//               Welcome, {session.user.name}!
//             </motion.p>
//           )}
//         </motion.header>

//         {status === "authenticated" && (
//           <motion.div
//             className="flex flex-col lg:flex-row items-center justify-center mb-32"
//             initial="hidden"
//             animate="visible"
//             variants={fadeIn}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <motion.img
//               src="/5.jpg"
//               alt="Bar Image"
//               className="w-full max-w-6xl h-auto rounded-3xl shadow-2xl"
//               whileHover={{ scale: 1.05 }}
//               transition={{ duration: 0.3 }}
//             />
//           </motion.div>
//         )}
//         <motion.div
//           className="flex flex-col items-center justify-center py-16"
//           initial="hidden"
//           animate="visible"
//           variants={fadeIn}
//           transition={{ duration: 0.8, delay: 1.0 }}
//         >
//           {status === "authenticated" ? (
//             isSubscribed ? (
//               <Card className="w-full max-w-3xl bg-gray-800 border-gray-700">
//                 <CardHeader>
//                   <CardTitle className="text-3xl font-bold text-center text-purple-400">
//                     You're Subscribed!
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="flex justify-center">
//                   <Button
//                     variant="outline"
//                     className="bg-gray-700 text-gray-200 hover:bg-gray-600"
//                   >
//                     <Link href="/account">Manage Your Subscription</Link>
//                   </Button>
//                 </CardContent>
//               </Card>
//             ) : (
//               <Card className="w-full max-w-3xl bg-gray-800 border-gray-700">
//                 <CardHeader>
//                   <CardTitle className="text-3xl font-bold text-center text-purple-400">
//                     Subscribe Now
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <form className="space-y-4">
//                     <Input
//                       type="text"
//                       name="name"
//                       placeholder="Name"
//                       value={userInfo.name}
//                       onChange={handleInputChange}
//                       required
//                       className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
//                     />
//                     <Input
//                       type="email"
//                       name="email"
//                       placeholder="Email"
//                       value={userInfo.email}
//                       onChange={handleInputChange}
//                       required
//                       className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
//                     />
//                     <Input
//                       type="tel"
//                       name="phoneNumber"
//                       placeholder="Phone Number"
//                       value={userInfo.phoneNumber}
//                       onChange={handleInputChange}
//                       required
//                       className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
//                     />
//                     <Input
//                       type="text"
//                       name="address"
//                       placeholder="Address"
//                       value={userInfo.address}
//                       onChange={handleInputChange}
//                       required
//                       className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
//                     />
//                     <div className="grid grid-cols-2 gap-4">
//                       <Input
//                         type="text"
//                         name="zipCode"
//                         placeholder="Zip Code"
//                         value={userInfo.zipCode}
//                         onChange={handleInputChange}
//                         required
//                         className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
//                       />
//                       <Input
//                         type="text"
//                         name="state"
//                         placeholder="State"
//                         value={userInfo.state}
//                         onChange={handleInputChange}
//                         required
//                         className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
//                       />
//                     </div>
//                     <Input
//                       type="text"
//                       name="country"
//                       placeholder="Country"
//                       value={userInfo.country}
//                       onChange={handleInputChange}
//                       required
//                       className="bg-gray-700 text-gray-200 placeholder-gray-400 border-gray-600"
//                     />
//                     <Select
//                       value={selectedProduct}
//                       onValueChange={(value) => setSelectedProduct(value)}
//                     >
//                       <SelectTrigger className="bg-gray-700 text-gray-200 border-gray-600">
//                         <SelectValue placeholder="Select a plan" />
//                       </SelectTrigger>
//                       <SelectContent className="bg-gray-700 text-gray-200 border-gray-600">
//                         <SelectItem value="basic">Basic - $15/month</SelectItem>
//                         <SelectItem value="registration">
//                           50$ for registration
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </form>
//                   <Button
//                     className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white"
//                     onClick={handleSubscribe}
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Processing...
//                       </>
//                     ) : (
//                       "Subscribe"
//                     )}
//                   </Button>
//                   {error && (
//                     <Alert
//                       variant="destructive"
//                       className="mt-4 bg-red-900 border-red-700 text-red-200"
//                     >
//                       <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                   )}
//                 </CardContent>
//               </Card>
//             )
//           ) : (
//             <p className="text-3xl text-purple-400 font-light">
//               Please sign in to subscribe.
//             </p>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   )
// }
