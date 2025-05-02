import { connectToDatabase } from '../../../lib/mongodb'

export default async function handler(req, res) {
  const { method } = req

  try {
    const { db } = await connectToDatabase()
    const essencesCollection = db.collection('essences')

    switch (method) {
      case 'POST':
        if (!req.body) {
          return res.status(400).json({ error: 'Veri gönderilmedi' })
        }

        const { essenceId, amount, userName } = req.body

        // Esansı bul
        const essence = await essencesCollection.findOne({ _id: essenceId })
        if (!essence) {
          return res.status(404).json({ error: 'Esans bulunamadı' })
        }

        // Stok kontrolü
        if (essence.stockAmount < amount || essence.totalDemand + amount > essence.stockAmount) {
          return res.status(400).json({ error: 'Yetersiz stok' })
        }

        const newDemand = {
          id: new Date().getTime(),
          userName,
          amount,
          date: new Date(),
          totalPrice: amount * essence.price,
          category: essence.category
        }

        // Esansı güncelle
        const result = await essencesCollection.updateOne(
          { _id: essenceId },
          {
            $push: { demands: newDemand },
            $inc: { totalDemand: amount }
          }
        )

        res.status(201).json(newDemand)
        break

      case 'DELETE':
        const { demandId, essenceId: deleteEssenceId } = req.body

        const targetEssence = await essencesCollection.findOne({ _id: deleteEssenceId })
        if (!targetEssence) {
          return res.status(404).json({ error: 'Esans bulunamadı' })
        }

        const demand = targetEssence.demands.find(d => d.id === demandId)
        if (!demand) {
          return res.status(404).json({ error: 'Talep bulunamadı' })
        }

        // Esansı güncelle
        const deleteResult = await essencesCollection.updateOne(
          { _id: deleteEssenceId },
          {
            $pull: { demands: { id: demandId } },
            $inc: { totalDemand: -demand.amount }
          }
        )

        res.status(200).json({ message: 'Talep başarıyla silindi' })
        break

      default:
        res.setHeader('Allow', ['POST', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' })
  }
}