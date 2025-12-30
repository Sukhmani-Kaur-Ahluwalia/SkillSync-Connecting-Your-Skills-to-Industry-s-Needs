const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Student = require('./models/Student');
const Job = require('./models/Job');
const Resource = require('./models/Resource');

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


// BRIDGE 2: Save student to the database
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save(); // Store the saved student
    res.json(savedStudent); // SEND THE WHOLE STUDENT BACK (including the _id)
  } catch (err) {
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
