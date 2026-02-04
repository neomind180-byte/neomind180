import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

// The word "GET" here must be all caps and spelled exactly like this
export async function GET() {
  console.log("Attempting to send email..."); // This will show in your Terminal
  
  // Replace with your real email
  const result = await sendWelcomeEmail('neomind180@gmail.com');
  
  console.log("Email result:", result); // This helps us debug
  return NextResponse.json(result);
}