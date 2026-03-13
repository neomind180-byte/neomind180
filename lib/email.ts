import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'pro.eu.turbo-smtp.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@neomind180.com';
const COACH_EMAIL = process.env.COACH_EMAIL || 'coach@neomind180.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.neomind180.com';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});


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
        <p><em><a href="${APP_URL}/dashboard/coach-admin" style="color: #00538e; font-weight: bold; text-decoration: none;">Reply to this message through your coach dashboard.</a></em></p>
      `
    });

    console.log("✅ Coach notification sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error notifying coach:", error);
    return { success: false, error };
  }
}
