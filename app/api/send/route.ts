import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Determine if this is a manual test or a Supabase trigger
    // Supabase webhooks send data in a 'record' object
    const email = body.record?.email || body.email;
    const firstName = body.record?.full_name?.split(' ')[0] || "there";

    if (!email) {
      return NextResponse.json({ error: "No recipient email found" }, { status: 400 });
    }

    // 2. The Welcome Template
    const { data, error } = await resend.emails.send({
      from: 'NeoMind180 <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to NeoMind180 | Your first 180° starts here',
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: auto; padding: 40px;">
          <h1 style="color: #00538e; text-transform: uppercase;">NeoMind180</h1>
          <p style="font-size: 18px;">Hello ${firstName},</p>
          <p style="font-size: 18px;">I am so glad you’ve decided to move from overthinking to clarity. Neo is ready for you.</p>
          <p style="font-size: 18px;">Your journey here is built on a simple premise: <strong>you are not your thoughts; you are the one observing them.</strong></p>
          <div style="margin-top: 40px;">
            <a href="https://neomind180.vercel.app/dashboard" style="background: #00538e; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">Enter Your Dashboard</a>
          </div>
          <p style="margin-top: 60px; font-size: 14px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Rethink. Rewire. Renew.</p>
          <p style="font-size: 16px;">— [Your Name]</p>
        </div>
      `
    });

    if (error) throw error;
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("EMAIL_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}