import bcrypt from "bcryptjs"
import User from "@/models/User"
import { mongooseConnect } from "@/lib/mongoose"

export default async function handler(req, res) {
  const { method } = req
  await mongooseConnect()

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await User.findOne({ _id: req.query.id }))
    } else {
      res.json(await User.find())
    }
  }

  if (method === "POST") {
    const { name, email, password } = req.body

    // Check if the user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userDoc = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    res.status(201).json(userDoc)
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await User.deleteOne({ _id: req.query?.id })
      res.json(true)
    }
  }
}
