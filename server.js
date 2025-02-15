const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.static('public'));

// Set up storage for uploaded images
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Debugging: Check if environment variables are loaded
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "LOADED" : "NOT LOADED");
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "LOADED" : "NOT LOADED");
console.log("RECIPIENT_EMAIL:", process.env.RECIPIENT_EMAIL ? "LOADED" : "NOT LOADED");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587, 
  secure: false, // Use true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Endpoint to handle image upload and email
app.post('/email-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded.' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: 'Captured Image',
    text: 'Here is the captured image.',
    attachments: [
      {
        filename: 'captured_image.png',
        content: req.file.buffer,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ success: false, message: 'Failed to send email.' });
    } else {
      console.log('Email sent:', info.response);
      return res.status(200).json({ success: true, message: 'Email sent successfully.' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
