

require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: [
    'http://localhost:5500',   
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'null',                    
  ],
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.sendMail({
  from: `"Test" <${process.env.GMAIL_USER}>`,
  to: process.env.GMAIL_USER,
  subject: 'Test Email from Portfolio Server',
  text: 'Hello Wiam! This is a test email from your Nodemailer server.'
}, (err, info) => {
  if (err) console.log(' Test email error:', err.message);
  else console.log(' Test email sent:', info.response);
});


function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim()
    .slice(0, 2000); // max length
}


app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Wiam Mabda portfolio backend is running.' });
});


app.post('/send-email', async (req, res) => {
  
  const name    = sanitize(req.body.name);
  const email   = sanitize(req.body.email);
  const message = sanitize(req.body.message);

  
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields (name, email, message) are required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address.',
    });
  }

  
  const mailOptions = {
    from:    `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to:      'waim.mabda.2006@gmail.com',   // destination
    replyTo: email,
    subject: `[Portfolio] New message from ${name}`,
    text: `
New message from your portfolio contact form
============================================
Name:    ${name}
Email:   ${email}

Message:
${message}
============================================
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0d1322; color: #e2e8f0; margin: 0; padding: 0; }
    .wrap { max-width: 580px; margin: 32px auto; background: #141d2e; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,.08); }
    .header { background: linear-gradient(135deg, #071624, #0e2840); padding: 32px 36px; }
    .header h1 { margin: 0; font-size: 1.5rem; color: #22d3ee; letter-spacing: -.02em; }
    .header p  { margin: 4px 0 0; color: #64748b; font-size: .9rem; }
    .body   { padding: 32px 36px; }
    .field  { margin-bottom: 22px; }
    .label  { font-size: .72rem; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; margin-bottom: 4px; }
    .value  { font-size: 1rem; color: #e2e8f0; }
    .msg-box{ background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 18px; margin-top: 4px; line-height: 1.7; }
    .footer { padding: 20px 36px; border-top: 1px solid rgba(255,255,255,.07); font-size: .78rem; color: #475569; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1> New Portfolio Message</h1>
    <p>Received via waimmabda.dev contact form</p>
  </div>
  <div class="body">
    <div class="field">
      <div class="label">Sender Name</div>
      <div class="value">${name}</div>
    </div>
    <div class="field">
      <div class="label">Reply-To Email</div>
      <div class="value"><a href="mailto:${email}" style="color:#22d3ee;">${email}</a></div>
    </div>
    <div class="field">
      <div class="label">Message</div>
      <div class="msg-box">${message.replace(/\n/g, '<br>')}</div>
    </div>
  </div>
  <div class="footer">This message was sent from your portfolio contact form. Reply directly to this email to respond.</div>
</div>
</body>
</html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(` Email sent | from: ${email} | name: ${name}`);
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
    });
  } catch (err) {
    console.error(' Nodemailer error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email. Please check server configuration.',
    });
  }
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});


app.listen(PORT, () => {
  console.log(`\n Server running → http://localhost:${PORT}`);
  console.log(` Emails will be sent to: waim.mabda.2006@gmail.com`);
  console.log(`   POST /send-email  — contact form endpoint\n`);
});

module.exports = app;
