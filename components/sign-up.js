// UserRegistrationForm.js
import React, { useState } from "react"
import axios from "axios"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Button } from "./ui/button"

const UserRegistrationForm = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false) // New state for loading
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true) // Start loading
    setError("") // Reset error state
    setMessage("") // Reset message state

    try {
      const response = await axios.post("/api/register", {
        name,
        email,
        password,
      })

      if (response.status === 201) {
        setMessage("User created successfully!")

        const signInResult = await signIn("credentials", {
          redirect: false,
          email,
          password,
        })

        if (signInResult.ok) {
          // Redirect to homepage after successful login
          router.push("/")
        } else {
          setError("Sign in failed. Please try logging in manually.")
        }

        // Reset form fields
        setName("")
        setEmail("")
        setPassword("")
      }
    } catch (error) {
      setError(error.response?.data.error || "An error occurred")
    } finally {
      setLoading(false) // Stop loading
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Create User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1" htmlFor="name">
            Name:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="email">
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="password">
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        {message && (
          <p className="mt-4 text-center text-green-500">{message}</p>
        )}
      </form>
      <div className="mt-4 text-center">
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default UserRegistrationForm
