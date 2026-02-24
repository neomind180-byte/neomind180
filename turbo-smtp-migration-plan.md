# 📧 TurboSMTP Migration & Cleanup Plan

This plan outlines the steps to migrate from Resend to TurboSMTP and clean up old configurations.

## 1. Environment Variables (Vercel & .env.local)

Update your environment variables in the Vercel Dashboard and your local `.env.local` file.

| Variable | New Value | Note |
| :--- | :--- | :--- |
| `SMTP_HOST` | `pro.eu.turbo-smtp.com` | |
| `SMTP_PORT` | `465` | SSL Port |
| `SMTP_USER` | `[your-consumer-key]` | Provided by TurboSMTP |
| `SMTP_PASSWORD` | `[your-consumer-secret]` | Provided by TurboSMTP |
| `SMTP_FROM_EMAIL` | `noreply@coach.neomind180.com` | Verified subdomain sender |
| `COACH_EMAIL` | `emmeline@coach.neomind180.com` | New coach email |

### Cleanup (Vercel)
- **Delete** `RESEND_API_KEY` once migration is verified.

---

## 2. Supabase Auth SMTP Settings

To ensure Auth emails (password reset, etc.) use TurboSMTP:

1. Go to **Supabase Dashboard** -> **Project Settings** -> **Auth**.
2. Scroll to **SMTP Settings**.
3. Enable **SMTP Service**.
4. Configure as follows:
   - **Sender Email**: `noreply@coach.neomind180.com`
   - **Sender Name**: `NeoMind180`
   - **Host**: `pro.eu.turbo-smtp.com`
   - **Port**: `465`
   - **Username**: `[your-consumer-key]`
   - **Password**: `[your-consumer-secret]`
5. Save changes.

---

## 3. Revised Webhooks (Supabase)

Instead of the frontend calling `/api/notify-coach`, we will use Supabase Webhooks for better reliability.

### New Webhook: `notify-coach-on-message`
1. Go to **Supabase Dashboard** -> **Database** -> **Webhooks**.
2. Create a new webhook:
   - **Name**: `notify-coach-on-message`
   - **Table**: `coach_messages`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **URL**: `https://neomind180.vercel.app/api/webhooks/notify-coach`
   - **Method**: `POST`
   - **HTTP Headers**:
     - `Content-Type`: `application/json`
     - `x-webhook-secret`: `[YOUR_SHARED_SECRET]` (Create a random secret)

### Cleanup (Supabase)
- **Delete** old SQL Triggers that were calling Edge Functions if they still exist:
  ```sql
  DROP TRIGGER IF EXISTS on_coach_message_created ON public.coach_messages;
  DROP FUNCTION IF EXISTS notify_coach_on_new_message();
  ```
- **Delete** old Edge Functions:
  - `notify-coach`
  - `notify-user`

---

## 4. Code Cleanup

### Update `app/dashboard/coach/page.tsx`
Remove the manual `fetch('/api/notify-coach', ...)` call since the webhook will handle it.

### Delete Old Files
- `supabase/functions/notify-coach/` (if it exists)
- `supabase/functions/notify-user/` (if it exists)

---

## 5. Summary of Actions
1. [x] Update `lib/email.ts` to use new env variables.
2. [x] Update `.env.local` placeholders.
3. [x] Update Vercel environment variables.
4. [x] Configure Supabase Auth SMTP.
5. [x] Create new Supabase Webhooks.
6. [x] Implement `/api/webhooks/notify-coach` (Next.js) for secure webhook handling.
