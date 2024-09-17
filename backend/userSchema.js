const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: false }
});

const agentSchema = new mongoose.Schema({
  agentId: { type: String, required: true }
});

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  agentId: { type: String, required: true },
  llm_id: { type: String, required: true },
  questions: [questionSchema]
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  projects: [projectSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
