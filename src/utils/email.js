import nodemailer from 'nodemailer';

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ahmad.saad.khn@gmail.com',
    pass: 'dwidrgurzwwwlkwr',
  },
});

// Function to send email
export const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'ahmad.saad.khn@gmail.com',
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};