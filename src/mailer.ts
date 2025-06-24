import nodemailer from 'nodemailer';
import { config } from './config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password, // Debe ser App Password si usás Gmail con 2FA
  },
});

export async function sendEmail(subject: string, body: string) {
  const mailOptions = {
    from: config.email.from,
    to: config.email.to.split(','),
    subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
  console.log('Correo enviado correctamente.');
}