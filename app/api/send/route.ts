import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, subject, html } = await req.json();

    // In the free tier, Resend allows you to send to your own email. 
    // To send to others, you eventually need to verify your domain.
    const { data, error } = await resend.emails.send({
      from: 'NeoMind180 <onboarding@resend.dev>', // Use this for testing
      to: [email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("RESEND_ERROR:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}