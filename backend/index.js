const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const usersRouter = require('./routes/users');

dotenv.config();

const app = express();

// Middleware de CORS e JSON
app.use(cors());
app.use(express.json());

// Rotas principais
app.use('/friends', require('./routes/Friends'));
app.use('/questions', require('./routes/questions'));
app.use('/users', usersRouter);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas de autenticação
app.use('/auth', require('./routes/auth'));

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store');
  }
}));

// Rota para verificar se o backend está rodando
app.get('/', (req, res) => {
  res.send('Backend do ProjetoKinisi está funcionando!');
});

// Configuração da porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});