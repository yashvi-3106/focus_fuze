const { MongoClient } = require('mongodb');

// Ensure the MONGO_URI environment variable is set to your Atlas connection string
const uri = process.env.MONGO_URI;  
const dbName = "focus_fuze";

let client;
let db;

async function connectToDatabase() {
  if (!client) {
    try {
      if (!uri) {
        throw new Error('MONGO_URI is not set. Please provide your MongoDB Atlas connection string.');
      }
      client = new MongoClient(uri);
      await client.connect();
      console.log('Connected to MongoDB Atlas');
      db = client.db(dbName);
    } catch (err) {
      console.error('Error connecting to MongoDB Atlas:', err);
      throw err;
    }
  }
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call connectToDatabase first.');
  return db;
}

module.exports = { connectToDatabase, getDb };