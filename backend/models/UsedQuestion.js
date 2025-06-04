const mongoose = require('mongoose');

// Schema para registrar questões já usadas e evitar repetição
const usedQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.UsedQuestion || mongoose.model('UsedQuestion', usedQuestionSchema);
