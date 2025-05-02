import { connectToDatabase } from '../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db } = await connectToDatabase()
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' })
    }

    const user = await db.collection('users').findOne({ email })

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz şifre' })
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' })
  }
}