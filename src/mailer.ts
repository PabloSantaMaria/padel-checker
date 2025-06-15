import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD, // Debe ser App Password si usás Gmail con 2FA
  },
});

export async function sendEmail(subject: string, body: string) {
  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: process.env.EMAIL_RECIPIENTS?.split(',') || [],
    subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
  console.log('Correo enviado correctamente.');
}