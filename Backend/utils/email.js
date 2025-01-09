const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'greenpoint7064@gmail.com',
    pass: 'ptjl kwny tutt hayo'
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendResetEmail = async (email, token) => {
  const mailOptions = {
    from: 'tu-email@gmail.com',
    to: email,
    subject: 'Código de Recuperación de Contraseña',
    text: `Tu código de recuperación es: ${token}`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
