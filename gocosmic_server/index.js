const express = require('express');
const server = express();
const cors = require('cors');
const nodemailer = require("nodemailer");

server.use(express.json());
server.use(cors());

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: '',
        pass: ''
    }
});

const MAX_REGISTRATIONS_PER_HOUR = 50;
const MAX_EMAILS_PER_HOUR = 10;
const BATCH_SIZE = 10;
let registrationsCount = 0;
let emailsToSend = [];

const resetCounts = () => {
  registrationsCount = 0;
  emailsToSend = [];
};

const handleRegistration = async (formData) => {

  if (registrationsCount >= MAX_REGISTRATIONS_PER_HOUR) {
    console.log("Registrations limit exceeded. Please try again later.");
    return;
  }


  registrationsCount++;


  emailsToSend.push(formData.Email);

  
  if (emailsToSend.length >= BATCH_SIZE) {
    await sendEmailBatch();
  }
};

const sendEmailBatch = async () => {

  if (emailsToSend.length === 0 || registrationsCount === 0) {
    return;
  }


  try {
    const message = {
      from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
      to: emailsToSend.join(','),
      subject: "Registered on goCosmic",
      text: `Hello, \n\nThanks from goCosmic !`,
      html: `<p>Hello,</p><p>Thanks for reaching out!</p>`
    };

    
    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    
    
    resetCounts();
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

server.post('/', async (req, res) => {
    const { Name, Email, Phone_no } = req.body;

    try {
        
        await handleRegistration({ Name, Email, Phone_no });

        
        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        console.error("Error handling registration:", error);
        res.status(500).json({ error: 'Failed to handle registration' });
    }
});

server.listen(8080, () => {
    console.log('Server started');
});
