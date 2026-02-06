import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, subject, html } = await req.json();

    // Verification check for the key
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing from environment.");
    }

    const { data, error } = await resend.emails.send({
      from: 'NeoMind180 <onboarding@resend.dev>', 
      to: [email],
      // Adding you as a Cc so you stay in the loop
      cc: ['neomind180@gmail.com'], 
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("RESEND_ERROR:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("EMAIL_SYSTEM_FAILURE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}