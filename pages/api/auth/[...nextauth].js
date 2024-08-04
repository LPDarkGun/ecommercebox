import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import User from "../../../models/User"
import { mongooseConnect } from "../../../lib/mongoose"

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
        const user = await User.findOne({ email }).exec()
        if (user && (await bcrypt.compare(password, user.password))) {
          return { id: user.id, email: user.email, name: user.name }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    session: async ({ session, token }) => {
      session.user.id = token.id
      session.user.email = token.email
      session.user.name = token.name
      return session
    },
    signIn: async ({ user, account }) => {
      return true
    },
  },
})
