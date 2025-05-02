import jwt from 'jsonwebtoken'

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return res.status(401).json({ error: 'Token bulunamadı' })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return res.status(401).json({ error: 'Geçersiz token' })
      }

      // Kullanıcı bilgilerini request nesnesine ekle
      req.user = decoded

      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Yetkilendirme hatası' })
    }
  }
}

export function withAdminAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return res.status(401).json({ error: 'Token bulunamadı' })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return res.status(401).json({ error: 'Geçersiz token' })
      }

      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' })
      }

      req.user = decoded

      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Yetkilendirme hatası' })
    }
  }
}