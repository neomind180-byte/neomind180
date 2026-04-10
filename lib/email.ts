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

export async function sendUpgradeConfirmationToUser(userEmail: string, userName: string, planName: string, planTagline: string) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180" <${FROM_EMAIL}>`,
      to: userEmail,
      bcc: COACH_EMAIL, // Also send a copy to the coach
      subject: `Welcome to ${planName} — Your Transformation Continues 🎉`,
      text: `Hi ${userName},\n\nThank you for upgrading to the ${planName} plan!\n\n${planTagline}\n\nYour new features are now active. Head to your dashboard to explore everything available to you.\n\n${APP_URL}/dashboard\n\nWith gratitude,\nCoach Emmeline\nNeoMind180`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9fb; border-radius: 16px;">
          <div style="background: #00538e; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">Welcome to ${planName}!</h1>
          </div>
          <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Thank you for upgrading your NeoMind180 membership. Your commitment to your mindset journey is truly inspiring.</p>
          <div style="background: #0AA390/10; border-left: 4px solid #0AA390; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
            <p style="color: #0AA390; font-weight: bold; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">${planName}</p>
            <p style="color: #555; margin: 8px 0 0; font-size: 14px; font-style: italic;">${planTagline}</p>
          </div>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Your new features are now active and ready. Head to your dashboard to explore everything available to you on this plan.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard" style="background: #00538e; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Go to My Dashboard</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="color: #888; font-size: 13px; text-align: center;">With gratitude,<br><strong style="color: #00538e;">Coach Emmeline</strong><br>NeoMind180 Mindset Coaching</p>
        </div>
      `
    });

    console.log("✅ Upgrade confirmation sent to user:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending upgrade confirmation to user:", error);
    return { success: false, error };
  }
}

export async function sendDowngradeConfirmationToUser(userEmail: string, userName: string) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: `Your Cancellation Request Has Been Received`,
      text: `Hi ${userName},\n\nWe've received your request to downgrade to the NeoMind180 Foundation (Free) plan.\n\nYour cancellation has been noted and will be processed by our team. You will continue to have access to your current plan features until your next billing date.\n\nYour free plan features remain active and available at any time.\n\nIf this was a mistake or you'd like to continue your journey with us, simply visit your dashboard and upgrade again.\n\n${APP_URL}/pricing\n\nWith gratitude,\nCoach Emmeline\nNeoMind180`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9fb; border-radius: 16px;">
          <div style="background: #444; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900;">Cancellation Received</h1>
          </div>
          <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">We've received your request to downgrade to the <strong>Clarity Foundation (Free)</strong> plan. Our team will process your cancellation and ensure you aren't billed further.</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Your free plan features remain active — your journey doesn't have to stop here.</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">If this was a mistake or you'd like to rejoin, we'd love to have you back.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/pricing" style="background: #00538e; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">View Plans</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="color: #888; font-size: 13px; text-align: center;">With gratitude,<br><strong style="color: #00538e;">Coach Emmeline</strong><br>NeoMind180 Mindset Coaching</p>
        </div>
      `
    });

    console.log("✅ Downgrade confirmation sent to user:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending downgrade confirmation to user:", error);
    return { success: false, error };
  }
}

// ─── Trial Lifecycle Emails ───────────────────────────────────────────────────

export async function sendTrialExpiryWarning(userEmail: string, userName: string, planName: string, daysLeft: number, expiresAt: string) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: `Your ${planName} Trial Expires in ${daysLeft} Day${daysLeft === 1 ? '' : 's'}`,
      text: `Hi ${userName},\n\nJust a heads-up — your ${planName} trial expires on ${expiresAt}.\n\nTo keep all your features active, upgrade to a paid plan before then.\n\n${APP_URL}/pricing\n\nWith gratitude,\nCoach Emmeline\nNeoMind180`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9fb; border-radius: 16px;">
          <div style="background: #F39904; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900;">⏳ Trial Ending Soon</h1>
          </div>
          <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Your <strong>${planName}</strong> trial expires in <strong style="color: #d9534f;">${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong> on <strong>${expiresAt}</strong>.</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">To keep all your features and continue your transformation journey without interruption, upgrade to a paid plan before your trial ends.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/pricing" style="background: #00538e; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Keep My Access →</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="color: #888; font-size: 13px; text-align: center;">With gratitude,<br><strong style="color: #00538e;">Coach Emmeline</strong><br>NeoMind180 Mindset Coaching</p>
        </div>
      `
    });
    console.log("✅ Trial expiry warning sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending trial expiry warning:", error);
    return { success: false, error };
  }
}

export async function sendTrialExpiredNotification(userEmail: string, userName: string, planName: string) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180" <${FROM_EMAIL}>`,
      to: userEmail,
      subject: `Your ${planName} Trial Has Ended`,
      text: `Hi ${userName},\n\nYour ${planName} trial has ended and your account has been moved back to the free Foundation plan.\n\nYour progress and data are safe. To regain access to premium features, visit our pricing page.\n\n${APP_URL}/pricing\n\nWith gratitude,\nCoach Emmeline\nNeoMind180`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9fb; border-radius: 16px;">
          <div style="background: #555; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900;">Trial Ended</h1>
          </div>
          <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Your <strong>${planName}</strong> trial has ended. Your account has been moved back to the free <strong>Clarity Foundation</strong> plan.</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Your progress, journal entries, and data are all safe. You can upgrade at any time to regain full access.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/pricing" style="background: #00538e; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">View Plans</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="color: #888; font-size: 13px; text-align: center;">With gratitude,<br><strong style="color: #00538e;">Coach Emmeline</strong><br>NeoMind180 Mindset Coaching</p>
        </div>
      `
    });
    console.log("✅ Trial expired notification sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending trial expired notification:", error);
    return { success: false, error };
  }
}

// ─── Coach Lifecycle Notifications ───────────────────────────────────────────

export async function notifyCoachOfUserUpgrade(userEmail: string, userName: string, newPlan: string) {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180 Billing" <${FROM_EMAIL}>`,
      to: COACH_EMAIL,
      subject: `New Paid Subscriber: ${userName} → ${newPlan}`,
      text: `${userName} (${userEmail}) has just subscribed to the ${newPlan} plan via PayFast.\n\nNo action required — their access has been automatically upgraded.`,
      html: `
        <h2 style="color: #0AA390;">New Paid Subscriber 🎉</h2>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>New Plan:</strong> ${newPlan}</p>
        <p style="color: #555;">Their access has been automatically upgraded. No action required.</p>
        <hr>
        <p><em><a href="${APP_URL}/dashboard/coach-admin" style="color: #00538e;">View in Coach Admin</a></em></p>
      `
    });
    console.log("✅ Coach upgrade notification sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error notifying coach of upgrade:", error);
    return { success: false, error };
  }
}

export async function notifyCoachOfUserDowngrade(userEmail: string, userName: string, oldPlan: string, reason: string = 'User requested') {
  try {
    const info = await transporter.sendMail({
      from: `"NeoMind180 Billing" <${FROM_EMAIL}>`,
      to: COACH_EMAIL,
      subject: `Subscriber Downgraded: ${userName}`,
      text: `${userName} (${userEmail}) has been downgraded from ${oldPlan} to the free plan.\nReason: ${reason}\n\nPlease cancel their PayFast recurring billing if not already done.`,
      html: `
        <h2 style="color: #d9534f;">Subscriber Downgraded</h2>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Previous Plan:</strong> ${oldPlan}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <hr>
        <p><em>Please ensure their PayFast recurring billing is cancelled if it was a paid subscription. <a href="https://www.payfast.co.za">PayFast Dashboard</a></em></p>
      `
    });
    console.log("✅ Coach downgrade notification sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error notifying coach of downgrade:", error);
    return { success: false, error };
  }
}
