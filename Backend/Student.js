const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  skillName: String,
  level: String
});

const studentSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  interests: [String],
  skills: [skillSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (only if password is provided and modified)
studentSchema.pre('save', async function(next) {
  // Skip if password is not modified or not provided
  if (!this.isModified('password') || !this.password) return next();
  // Only hash if password is a string and not already hashed
  if (typeof this.password === 'string' && this.password.length < 60) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
studentSchema.methods.comparePassword = async function(candidatePassword) {
  // Check if password exists and candidate password is provided
  if (!this.password || !candidatePassword) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema, 'Student');