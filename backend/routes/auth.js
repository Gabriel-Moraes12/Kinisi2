const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/nodemailer');

// Rota de registro de usuário
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Por favor, insira um e-mail válido.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado. Por favor, faça login ou use outro e-mail.' });
    }

    const emailToken = crypto.randomBytes(64).toString('hex');
    const user = new User({
      name,
      email,
      password,
      emailToken,
      isVerified: false,
    });

    await user.save();

    const verificationLink = `http://localhost:5000/auth/verify-email?token=${emailToken}`;
    await sendEmail(
      email,
      'Verifique seu e-mail - ProjetoKinisi',
      `Olá ${name},\n\nPor favor, clique no link abaixo para verificar seu e-mail:\n\n${verificationLink}\n\nSe você não solicitou este cadastro, ignore este e-mail.`
    );

    res.status(201).json({ 
      message: 'Registro realizado! Verifique seu e-mail para ativar sua conta.',
      userEmail: email
    });
  } catch (error) {
    res.status(400).json({ error: 'Erro durante o registro. Por favor, tente novamente.' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'E-mail não encontrado. Verifique ou cadastre-se.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta. Tente novamente.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'E-mail não verificado. Verifique sua caixa de entrada e clique no link de confirmação.' 
      });
    }

    // Retorna os dados do usuário sem informações sensíveis
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor. Tente novamente mais tarde.' });
  }
});

// Rota para solicitar redefinição de senha
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'E-mail não cadastrado em nosso sistema.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:8081/auth/reset-password?token=${token}`;
    
    await sendEmail(
      email,
      'Redefinição de Senha - ProjetoKinisi',
      `Olá,\n\nRecebemos uma solicitação para redefinir sua senha. Clique no link abaixo para continuar:\n\n${resetLink}\n\nEste link expira em 1 hora.\n\nSe você não solicitou isso, ignore este e-mail.`
    );

    res.json({ message: 'E-mail de recuperação enviado com sucesso. Verifique sua caixa de entrada.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar e-mail de recuperação. Tente novamente.' });
  }
});

// Rota para redefinir senha
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Solicite um novo.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Senha redefinida com sucesso! Agora você pode fazer login.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao redefinir senha. Tente novamente.' });
  }
});

// Rota para verificar e-mail
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ emailToken: token });

    if (!user) {
      return res.send(`
        <html>
          <head>
            <title>Verificação de E-mail</title>
            <script>
              setTimeout(() => {
                window.location.href = 'http://localhost:8081/EmailVerifiedScreen?status=failed';
              }, 2000);
            </script>
          </head>
          <body>
            <h1>Token inválido ou expirado</h1>
            <p>Redirecionando para o app...</p>
          </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.emailToken = undefined;
    await user.save();

    res.send(`
      <html>
        <head>
          <title>E-mail Verificado</title>
          <script>
            setTimeout(() => {
              window.location.href = 'http://localhost:8081/EmailVerifiedScreen?status=success';
            }, 2000);
          </script>
        </head>
        <body>
          <h1>E-mail verificado com sucesso!</h1>
          <p>Redirecionando para o app...</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.send(`
      <html>
        <head>
          <script>
            setTimeout(() => {
              window.location.href = 'http://localhost:8081/EmailVerifiedScreen?status=error';
            }, 2000);
          </script>
        </head>
        <body>
          <h1>Erro ao verificar e-mail</h1>
        </body>
      </html>
    `);
  }
});

module.exports = router;