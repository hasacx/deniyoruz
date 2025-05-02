import { connectToDatabase } from '../../../lib/mongodb'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  const { method } = req

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('users')

    switch (method) {
      case 'POST':
        // Kayıt işlemi
        if (!req.body) {
          return res.status(400).json({ error: 'Veri gönderilmedi' })
        }

        const { email, password, ...userData } = req.body

        // Email kontrolü
        const existingUser = await collection.findOne({ email })
        if (existingUser) {
          return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' })
        }

        // Şifreyi hashleme
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = {
          ...userData,
          email,
          password: hashedPassword,
          createdAt: new Date(),
          role: 'user' // Varsayılan rol
        }

        const result = await collection.insertOne(newUser)
        
        // Şifreyi çıkararak kullanıcı bilgilerini döndür
        const { password: _, ...userWithoutPassword } = newUser
        res.status(201).json(userWithoutPassword)
        break

      case 'GET':
        // Kullanıcı listesi (sadece admin için)
        const users = await collection.find({}).project({ password: 0 }).toArray()
        res.status(200).json(users)
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' })
  }
}