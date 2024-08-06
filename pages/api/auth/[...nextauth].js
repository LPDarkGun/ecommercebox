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
        emailOrPhone: {
          label: "Email or Phone",
          type: "text",
          placeholder: "jsmith@example.com or 1234567890",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { emailOrPhone, password } = credentials
        await mongooseConnect()

        // Find user by either email or phone
        const user = await User.findOne({
          $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
        }).exec()

        if (user && (await bcrypt.compare(password, user.password))) {
          return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            customerId: user.stripeCustomerId,
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
        token.phone = user.phone
        token.name = user.name
        token.customerId = user.customerId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.email = token.email
      session.user.phone = token.phone
      session.user.name = token.name
      session.user.customerId = token.customerId
      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
})
