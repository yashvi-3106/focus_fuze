const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 5000;

app.use(express.json());

const uri = "mongodb://127.0.0.1:27017";
const dbName = "focus_fuze";


let db, users;
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    users = db.collection('users');
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });


app.post('/register', async (req, res) => {
  const { fullname, username, password, confirmPassword } = req.body;


  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await users.findOne({ username });
  if (existingUser) {
    return res.status(400).send('Username already exists');
  }


  try {
    const result = await users.insertOne({
      fullname,
      username,
      password: hashedPassword,
    });
    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

 
  const user = await users.findOne({ username });
  if (!user) {
    return res.status(400).send('User not found');
  }

 
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send('Invalid password');
  }

  
  const token = jwt.sign({ userId: user._id }, 'your_jwt_secret_key', {
    expiresIn: '1h',
  });

  res.status(200).json({ token });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
