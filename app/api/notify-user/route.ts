import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const SMTP_HOST = 'smtp.resend.com';
const SMTP_PORT = 465;
const SMTP_USER = 'resend';
const SMTP_PASSWORD = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'coach_emmeline@coach.neomind180-neurocoaching.com';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://neomind180-neurocoaching.com';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const expectedToken = `Bearer ${process.env.NOTIFY_AUTH_TOKEN}`;

        if (!authHeader || authHeader !== expectedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { record } = body;

        if (!record || !record.user_email || !record.coach_reply) {
            return NextResponse.json({ error: 'Missing record data' }, { status: 400 });
        }

        // Send email to the user notifying them of the coach's reply
        const info = await transporter.sendMail({
            from: `"Coach Emmeline" <${FROM_EMAIL}>`,
            to: record.user_email,
            subject: `New Reply from Coach Emmeline: ${record.subject}`,
            text: `Hello ${record.user_name},\n\nCoach Emmeline has replied to your message.\n\nReply:\n${record.coach_reply}\n\nYou can view the full conversation in your dashboard.`,
            html: `
        <h2>New Reply from Coach Emmeline</h2>
        <p>Hello ${record.user_name},</p>
        <p>Coach Emmeline has replied to your message regarding "<strong>${record.subject}</strong>".</p>
        <p><strong>Coach's Reply:</strong></p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #00538e;">
          <p style="white-space: pre-wrap; margin: 0;">${record.coach_reply}</p>
        </div>
        <p style="margin-top: 20px;">
          <a href="${DASHBOARD_URL}/dashboard/coach" style="background-color: #00538e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">View Conversation</a>
        </p>
        <hr>
        <p style="font-size: 12px; color: #64748b;"><em>You are receiving this because you contacted the coach on NeoMind180.</em></p>
      `
        });

        console.log("✅ User notification sent:", info.messageId);
        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
        console.error("❌ Error sending notification to user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
