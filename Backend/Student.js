const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  skillName: String,
  level: String
});

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  interests: [String],
  skills: [skillSchema]
});

module.exports = mongoose.model('Student', studentSchema, 'Student');