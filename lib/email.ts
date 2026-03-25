import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'pro.eu.turbo-smtp.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'coach@neomind180.com';
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

export async function notifyCoachOfUpgradeCancellation(userEmail: string, userName: string, oldPlan: string, newPlan: string) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180 Billing" <${FROM_EMAIL}>`,
      to: COACH_EMAIL,
      subject: `UPGRADE ALERT: Cancel Old Subscription for ${userName}`,
      text: `User ${userName} (${userEmail}) just upgraded/switched from ${oldPlan} to the ${newPlan} plan.\n\nCRITICAL: Please log into PayFast and MANUALLY CANCEL their old ${oldPlan} recurring token to prevent them from being billed twice!`,
      html: `
        <h2 style="color: #F39904;">Plan Upgrade/Switch Detected</h2>
        <p>A user just started a new subscription for the <strong>${newPlan}</strong> plan, but their old PayFast recurring billing must be cancelled manually so they aren't double-billed.</p>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p style="color: #d9534f; font-weight: bold;"><strong>OLD Plan to Cancel: ${oldPlan}</strong></p>
        <p style="color: #0AA390; font-weight: bold;"><strong>NEW Plan Active: ${newPlan}</strong></p>
        <hr>
        <p><em>Please log into your <a href="https://www.payfast.co.za">PayFast Merchant Dashboard</a>, locate their old subscription, and cancel it immediately.</em></p>
      `
    });

    console.log("✅ Coach upgrade cancellation notification sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error notifying coach of upgrade:", error);
    return { success: false, error };
  }
}

export async function notifyCoachOfCancellation(userEmail: string, userName: string, planName: string) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180 Billing" <${FROM_EMAIL}>`,
      to: COACH_EMAIL,
      subject: `URGENT: Subscription Cancellation Request - ${userName}`,
      text: `User ${userName} (${userEmail}) has requested to cancel their ${planName} subscription.\n\nPlease log in to your PayFast merchant dashboard and manually cancel their recurring token/subscription to prevent future billing.`,
      html: `
        <h2 style="color: #d9534f;">Subscription Cancellation Required</h2>
        <p>A user has downgraded their account to the Free tier, but their <strong>PayFast recurring billing must be cancelled manually</strong>.</p>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Plan Cancelled:</strong> ${planName}</p>
        <hr>
        <p><em>Please log into your <a href="https://www.payfast.co.za">PayFast Merchant Dashboard</a>, locate this user's subscription, and cancel it immediately.</em></p>
      `
    });

    console.log("✅ Coach cancellation notification sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error notifying coach of cancellation:", error);
    return { success: false, error };
  }
}
