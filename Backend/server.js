const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Student = require('./models/Student');
const Job = require('./models/Job');
const Resource = require('./models/Resource');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Connection to the MongoDB Database : SkillSync Cluster
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Checking whether backend is running perfectly or not.
app.get('/', (req, res) => {
  res.send("Backend is running");
});

// BRIDGE 1: Get all jobs from the database (SkillSync Cluster)
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});
app.get('/api/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});
app.get('/api/resources', async (req, res) => {
  const resources = await Resource.find();
  res.json(resources);
});

// Login - Check student email and verify password
app.post('/api/auth/check-student', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find student by email
    const student = await Student.findOne({ email: normalizedEmail });
    
    if (!student) {
      // Student does not exist
      return res.json({
        exists: false,
        authenticated: false,
        message: 'Account not found. Please create your account first.'
      });
    }
    
    // Student exists - verify password
    // Check if student has a password (for old accounts that might not have passwords)
    if (!student.password) {
      return res.status(401).json({ 
        exists: true,
        authenticated: false,
        error: 'No password set',
        message: 'This account does not have a password. Please contact support or create a new account.'
      });
    }
    
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        exists: true,
        authenticated: false,
        error: 'Invalid password',
        message: 'Incorrect password. Please try again.'
      });
    }
    
    // Password is correct - return student data
    res.json({
      exists: true,
      authenticated: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        interests: student.interests || [],
        skills: student.skills || []
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Authentication Routes
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide email, password, and name' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
    const user = new User({ email, password, name });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get current user
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint to check all registered users (for development/testing)
// NOTE: Remove or protect this route in production!
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords from response
    res.json({
      count: users.length,
      users: users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRIDGE 2: Save student to the database (with password)
app.post('/api/students', async (req, res) => {
  try {
    const { name, email, password, interests, skills } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Password is required only for new students
    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if student with this email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase().trim() });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this email already exists. Use update endpoint to edit profile.' });
    }
    
    // Password is required for new students
    if (!password) {
      return res.status(400).json({ error: 'Password is required for new accounts' });
    }
    
    // Create new student (password will be hashed by pre-save hook)
    // For new registrations, interests and skills can be empty initially
    const student = new Student({
      name,
      email: email.toLowerCase().trim(),
      password,
      interests: interests || [],
      skills: skills || []
    });
    
    const savedStudent = await student.save();
    
    console.log('New student created:', savedStudent.email);
    
    // Return student data without password
    const studentResponse = {
      _id: savedStudent._id,
      name: savedStudent.name,
      email: savedStudent.email,
      interests: savedStudent.interests || [],
      skills: savedStudent.skills || [],
      createdAt: savedStudent.createdAt
    };
    
    res.status(201).json(studentResponse);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update student profile (for editing existing profiles - password not required)
app.put('/api/students/:studentId', async (req, res) => {
  try {
    const { name, interests, skills } = req.body;
    const { studentId } = req.params;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Find and update student (password is not updated here)
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Update only allowed fields using findByIdAndUpdate to avoid password validation
    const updateData = { name };
    if (interests) updateData.interests = interests;
    if (skills) updateData.skills = skills;
    
    // Use findByIdAndUpdate to avoid triggering password validation
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updateData },
      { new: true, runValidators: false } // Don't run validators to avoid password requirement
    );
    
    console.log('Student profile updated:', updatedStudent.email);
    
    // Return student data without password
    const studentResponse = {
      _id: updatedStudent._id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      interests: updatedStudent.interests || [],
      skills: updatedStudent.skills || [],
      createdAt: updatedStudent.createdAt
    };
    
    res.json(studentResponse);
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ error: err.message });
  }
});


// BRIDGE 3: Job Matching % calcultion and resources
app.get('/api/match/:studentId', async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  const jobs = await Job.find();

  const studentSkills = student.skills.map(s => s.skillName);

  const results = await Promise.all(
    jobs.map(async job => {
      const commonSkills = job.requiredSkills.filter(skill =>
        studentSkills.includes(skill)
      );

      const missingSkills = job.requiredSkills.filter(skill =>
        !studentSkills.includes(skill)
      );

      const resources = await Resource.find({
        skillName: { $in: missingSkills }
      });

      const matchPercentage = Math.round((commonSkills.length / job.requiredSkills.length) * 1000) / 10;

      return {
        job,
        matchPercentage,
        missingSkills,
        learningResources: resources
      };
    })
  );

  res.json(results);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
