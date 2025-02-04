const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('./db');

const router = express.Router();

// GET all goals
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const goals = db.collection('goals');
    const allGoals = await goals.find().toArray();
    res.status(200).json(allGoals);
  } catch (err) {
    res.status(500).send('Error fetching goals: ' + err.message);
  }
});

// POST a new goal
router.post('/', async (req, res) => {
  try {
    const newGoal = req.body;
    const db = getDb();
    const goals = db.collection('goals');
    const result = await goals.insertOne(newGoal);
    res.status(201).send({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).send('Error adding goal: ' + err.message);
  }
});

// PATCH (partially update) a goal by ID
router.patch('/_id/:_oid', async (req, res) => {
  try {
    const _oid = new ObjectId(req.params._oid);
    const updates = req.body;
    const db = getDb();
    const goals = db.collection('goals');
    const result = await goals.updateOne({ _id: _oid }, { $set: updates });
    res.status(200).send(`${result.modifiedCount} document(s) updated`);
  } catch (err) {
    res.status(500).send('Error partially updating goal: ' + err.message);
  }
});

// PATCH (partially update) a goal by ID (Mark as Complete or Claim Reward)
router.patch('/_id/:_oid', async (req, res) => {
  try {
    const _oid = new ObjectId(req.params._oid);
    const { status, rewardStatus } = req.body; // Update status or rewardStatus
    const db = getDb();
    const goals = db.collection('goals');
    const updates = {};
    
    if (status) updates.status = status;
    if (rewardStatus) updates.rewardStatus = rewardStatus;

    const result = await goals.updateOne({ _id: _oid }, { $set: updates });
    res.status(200).send(`${result.modifiedCount} document(s) updated`);
  } catch (err) {
    res.status(500).send('Error updating goal: ' + err.message);
  }
});


// DELETE a goal by ID
router.delete('/_id/:_oid', async (req, res) => {
  try {
    const _oid = new ObjectId(req.params._oid);
    const db = getDb();
    const goals = db.collection('goals');
    const result = await goals.deleteOne({ _id: _oid });
    res.status(200).send(`${result.deletedCount} document(s) deleted`);
  } catch (err) {
    res.status(500).send('Error deleting goal: ' + err.message);
  }
});

module.exports = router;
