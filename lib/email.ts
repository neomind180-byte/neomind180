import nodemailer from 'nodemailer';

const SMTP_HOST = 'smtp.resend.com';
const SMTP_PORT = 587;
const SMTP_USER = 'resend';
const SMTP_PASSWORD = process.env.RESEND_API_KEY; // Using the new API key
const FROM_EMAIL = 'onboarding@resend.dev';
const COACH_EMAIL = 'neomind180@gmail.com';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export async function sendWelcomeEmail(toEmail: string) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: "Welcome to NeoMind180 – Let’s begin",
      text: "Welcome to NeoMind180.",
      html: "<b>Welcome to NeoMind180.</b>",
    });

    console.log("✅ Welcome email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return { success: false, error };
  }
}

export async function notifyCoachOfMessage(record: any) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180 Notifier" <${FROM_EMAIL}>`,
      to: COACH_EMAIL,
      subject: `New Message: ${record.subject}`,
      text: `New Message from ${record.user_name} (From: ${record.user_email})\n\nSubject: ${record.subject}\n\nMessage:\n${record.message}`,
      html: `
        <h2>New Message from ${record.user_name}</h2>
        <p><strong>From:</strong> ${record.user_email}</p>
        <p><strong>Subject:</strong> ${record.subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${record.message}</p>
        <hr>
        <p><em><a href="https://neomind180.vercel.app/dashboard/coach-admin" style="color: #00538e; font-weight: bold; text-decoration: none;">Reply to this message through your coach dashboard.</a></em></p>
      `
    });

    console.log("✅ Coach notification sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error notifying coach:", error);
    return { success: false, error };
  }
}
