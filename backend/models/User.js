const mongoose = require('mongoose');

// Schema do usuário, incluindo informações de perfil, amigos e estatísticas
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, insira um e-mail válido']
  },
  password: { type: String, required: true },
  profileImage: { type: String }, // URL da imagem de perfil
  isVerified: { type: Boolean, default: false }, // E-mail verificado
  emailToken: { type: String }, // Token para verificação de e-mail
  resetPasswordToken: { type: String }, // Token para reset de senha
  resetPasswordExpires: { type: Date }, // Expiração do token de reset
  friends: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    date: { type: Date, default: Date.now }
  }],
  friendRequests: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  // Estatísticas de questões
  questionStats: {
    daily: {
      total: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 },
      lastUpdated: { type: Date }
    },
    totalQuestions: { type: Number, default: 0 },
    topics: [{
      name: { type: String, required: true },
      total: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 }
    }]
  }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.emailToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
    }
  }
});

// Middleware para resetar estatísticas diárias se for um novo dia
userSchema.pre('save', function(next) {
  const now = new Date();
  const lastUpdated = this.questionStats.daily.lastUpdated;
  
  // Se não tem data ou se é um novo dia, reseta as estatísticas diárias
  if (!lastUpdated || 
      lastUpdated.getDate() !== now.getDate() || 
      lastUpdated.getMonth() !== now.getMonth() || 
      lastUpdated.getFullYear() !== now.getFullYear()) {
    this.questionStats.daily.total = 0;
    this.questionStats.daily.correct = 0;
    this.questionStats.daily.wrong = 0;
    this.questionStats.daily.lastUpdated = now;
  }
  
  next();
});

// Método para atualizar estatísticas após responder uma questão
userSchema.methods.updateQuestionStats = function(topic, isCorrect) {
  // Garante que questionStats existe
  if (!this.questionStats) {
    this.questionStats = {
      daily: { total: 0, correct: 0, wrong: 0, lastUpdated: new Date() },
      totalQuestions: 0,
      topics: []
    };
  }

  // Atualiza estatísticas diárias
  this.questionStats.daily.total += 1;
  if (isCorrect) {
    this.questionStats.daily.correct += 1;
  } else {
    this.questionStats.daily.wrong += 1;
  }
  this.questionStats.daily.lastUpdated = new Date();

  // Atualiza total de questões
  this.questionStats.totalQuestions += 1;

  // Busca estatísticas do tópico
  let topicStats = this.questionStats.topics.find(t => t.name === topic);

  if (!topicStats) {
    // Cria e adiciona o tópico ao array
    this.questionStats.topics.push({
      name: topic,
      total: 0,
      correct: 0,
      wrong: 0
    });
    // Recupera a referência correta do objeto recém-adicionado
    topicStats = this.questionStats.topics[this.questionStats.topics.length - 1];
  }

  // Atualiza estatísticas do tópico
  topicStats.total += 1;
  if (isCorrect) {
    topicStats.correct += 1;
  } else {
    topicStats.wrong += 1;
  }

  // Não salva accuracyPercentage no banco, só calcula na resposta

  return this.save();
};

// Virtual para calcular percentual geral de acerto
userSchema.virtual('questionStats.overallAccuracy').get(function() {
  if (this.questionStats.totalQuestions === 0) return 0;
  return Math.round((this.questionStats.daily.correct / this.questionStats.daily.total) * 100);
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;