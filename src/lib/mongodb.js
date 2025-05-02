import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış')
}

if (!process.env.MONGODB_DB) {
  throw new Error('MONGODB_DB ortam değişkeni tanımlanmamış')
}

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI)
  const db = client.db(process.env.MONGODB_DB)

  cachedClient = client
  cachedDb = db

  return { client, db }
}