require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'pro.eu.turbo-smtp.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT || '465') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180 Billing" <${process.env.SMTP_FROM_EMAIL || 'noreply@neomind180.com'}>`,
      to: process.env.COACH_EMAIL || 'coach@neomind180.com',
      subject: `Test SMTP Email`,
      text: `Hello, this is a test to verify your SMTP credentials work.`,
    });
    console.log("SUCCESS:", info.messageId);
  } catch (err) {
    console.error("FAILED TO SEND:", err);
  }
}

testEmail();
