import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
// Get the directory path of the current module

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.SMTP_EMAIL}`,
    pass: `${process.env.SMTP_PASSWORD}`,
  },
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to,
    subject,
    text,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
