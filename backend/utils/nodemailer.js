const nodemailer = require('nodemailer');

// Configuração do transporte de e-mail usando Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use o serviço de e-mail que preferir
  auth: {
    user: process.env.EMAIL_USER, // Seu e-mail
    pass: process.env.EMAIL_PASS, // Sua senha do e-mail
  },
});

// Função para enviar e-mails
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
};

module.exports = sendEmail;