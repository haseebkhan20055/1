const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors'); // For handling cross-origin requests
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.static('public')); // Serve static files from the "public" folder

// Set up storage for uploaded images
const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage });

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: process.env.EMAIL_USER, // Your email address (from .env)
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password (from .env)
  },
});

// Endpoint to handle image upload and email
app.post('/email-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded.' });
  }

  // Email details
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: process.env.RECIPIENT_EMAIL, // Recipient address (from .env)
    subject: 'Captured Image', // Email subject
    text: 'Here is the captured image.', // Email body
    attachments: [
      {
        filename: 'captured_image.png',
        content: req.file.buffer, // Attach the image from memory
      },
    ],
  };

  // Send the email
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