// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import User from "@/models/User"
import { mongooseConnect } from "@/lib/mongoose"
import bcrypt from "bcryptjs"

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials
        await mongooseConnect()
        const user = await User.findOne({ email: email.toLowerCase() }).exec()

        if (user && (await bcrypt.compare(password, user.password))) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            customerId: user.stripeCustomerId, // Changed to customerId for consistency
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.customerId = user.customerId // Ensure this is set
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.email = token.email
      session.user.name = token.name
      session.user.customerId = token.customerId // Ensure this is set
      return session
    },
  },
  pages: {
    signIn: "/sign-in", // Add this if you have a custom sign-in page
  },
})
