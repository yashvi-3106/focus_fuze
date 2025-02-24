const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
const dbName = "focus_fuze";
let db; // ✅ Define db variable

async function connectToDatabase() {
  try {
    if (!uri) {
      throw new Error("MONGO_URI is not set. Please provide your MongoDB connection string.");
    }

    const connection = await mongoose.connect(uri, { dbName, useNewUrlParser: true, useUnifiedTopology: true });

    db = connection.connection.db; // ✅ Assign db from mongoose connection
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    throw err;
  }
}

const getDb = () => {
  if (!db) throw new Error("Database not initialized. Call connectToDatabase first.");
  return db;
};

module.exports = { connectToDatabase, getDb };