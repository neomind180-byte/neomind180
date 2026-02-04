import nodemailer from 'nodemailer';

export async function sendWelcomeEmail(toEmail: string) {
  // 1. Print settings to the terminal to see if they exist
  console.log("--------------------------------");
  console.log("DEBUG CHECK:");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("--------------------------------");

  // 2. Setup the transporter (Connect to Gmail)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 3. Send the email
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Welcome to NeoMind180 – Let’s begin",
      text: "Welcome to NeoMind180.",
      html: "<b>Welcome to NeoMind180.</b>",
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error };
  }
}