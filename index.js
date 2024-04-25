// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://bswork9617:E1IU9lvuOQK6zw5B@cluster0.dvmgrph.mongodb.net/enquiry-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define Enquiry schema
const enquirySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
    required: true
  }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);
const User = mongoose.model('User', userSchema);
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Routes
// POST a new enquiry
app.post('/api/enquiries', async (req, res) => {
  try {
    const enquiry = new Enquiry({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      description: req.body.description
    });
    await enquiry.save();
    res.status(201).json({ message: 'Enquiry submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password
    })
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if the user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // If user exists and password is correct, return success message, user data, and role
    res.status(200).json({ message: 'Login successful', user: { email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all enquiries
app.get('/api/enquiries', async (req, res) => {
  try {
    const enquiries = await Enquiry.find();
    res.status(200).json(enquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE an enquiry by ID
app.delete('/api/enquiries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Enquiry.findByIdAndDelete(id);
    res.status(200).json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/enquiries/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, description, date } = req.body;
  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, {
      firstName,
      lastName,
      email,
      description,
      date
    }, { new: true });
    res.status(200).json(updatedEnquiry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
