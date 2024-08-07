import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "./ui/button"
import Link from "next/link"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      redirect: false,
      email, // Use email for login
      password,
    })

    if (result.error) {
      setError(result.error || "An error occurred during login")
    } else {
      window.location.href = "/"
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
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
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        {error && <p className="mt-2 text-red-500 text-center">{error}</p>}
      </form>
      <div className="mt-4 text-center">
        <p>
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
