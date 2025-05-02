import { connectToDatabase } from '../../../lib/mongodb'

export default async function handler(req, res) {
  const { method } = req

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('essences')

    switch (method) {
      case 'GET':
        const essences = await collection.find({}).toArray()
        res.status(200).json(essences)
        break

      case 'POST':
        if (!req.body) {
          return res.status(400).json({ error: 'Veri gönderilmedi' })
        }

        const newEssence = {
          ...req.body,
          createdAt: new Date(),
          totalDemand: 0,
          demands: []
        }

        const result = await collection.insertOne(newEssence)
        res.status(201).json(result)
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' })
  }
}