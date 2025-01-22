const express = require('express');
const { ObjectId } = require('mongodb'); 
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "focus_fuze";

app.use(express.json());
app.use(cors());

let db, goals;

async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        goals = db.collection("goals");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    }
}


initializeDatabase();

app.get('/goals', async (req, res) => {
    try {
        const allGoals = await goals.find().toArray();
        res.status(200).json(allGoals);
    } catch (err) {
        res.status(500).send("Error fetching goals: " + err.message);
    }
});



app.post('/goals', async (req, res) => {
    try {
        const newGoal = req.body;
        const result = await goals.insertOne(newGoal);
        res.status(201).send(`Goal added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding goal: " + err.message);
    }
});


app.patch("/goals/_id/:_oid", async (req, res) => {
    try {
      const _oid = new ObjectId(req.params._oid);
      const updates = req.body;
      const result = await goals.updateMany({ _id: _oid }, { $set: updates });
      res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
      res.status(500).send("Error partially updating goals: " + err.message);
    }
});



  app.delete("/goals/_id/:_oid", async (req, res) => {
    try {
      const _oid = new ObjectId(req.params._oid);
      const result = await goals.deleteOne({ _id: _oid });
      res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
      res.status(500).send("Error deleting goal: " + err.message);
    }
  });