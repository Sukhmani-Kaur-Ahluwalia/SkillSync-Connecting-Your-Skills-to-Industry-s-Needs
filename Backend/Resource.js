const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  skillName: String,
  resourceType: String,
  link: String,
  difficulty: String
});

module.exports = mongoose.model('Resources', resourceSchema, 'Resources');