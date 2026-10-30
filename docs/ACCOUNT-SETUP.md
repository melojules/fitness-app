# Connect registration and admin approval

The app now uses Supabase Auth for email/password accounts and a shared Postgres table for registration requests. Until configured, the login page explains that accounts are not connected and prevents submissions. There is no password-free Admin shortcut.

## 1. Create the backend

Create a Supabase project you own. Open its SQL editor and run `supabase/migrations/202609160001_registration_approval.sql` once. This adds account records, automatic pending registration, email-verification tracking, read restrictions, and the admin-only review operation. It does not upload or change your local workout history.

## 2. Configure email and redirects

In Authentication settings, enable email/password sign-in and new signups. Keep email confirmation enabled. Set minimum password length to 12. These settings were checked on the connected project on September 20, 2026.

The Free project's default email templates send confirmation and password reset **links**. The app now handles these links. In **Authentication → URL Configuration**, allow the exact native redirect `fitnessapp-yriwgdjdxpppgufyhyrk://auth` and the exact web origin where the app is running (for example, `http://localhost:8126` during local web testing). The native redirect requires a development or production build with the configured app scheme; Expo Go does not register this custom scheme. Do not use a wildcard redirect for the web app.

If you later configure your own SMTP sender, you can instead edit both **Confirm sign up** and **Reset password** email templates to include a code:

```html
<p>Your Fitness App code is:</p>
<p><strong>{{ .Token }}</strong></p>
<p>Enter this code in the app. If you did not request it, ignore this email.</p>
```

Configure your own SMTP sender for production email delivery. Supabase's development email sender has recipient and rate limits; it should not be used to launch registration for real members. No admin email alerts are sent by this implementation: requests appear in the in-app review queue.

## 3. Connect the app

Copy `.env.example` to `.env.local`, then replace both placeholders with the project's HTTPS URL and **publishable** key. Never place a secret or service-role key in an `EXPO_PUBLIC_` variable or in the app. Restart Expo after changing these values.

## 4. Establish the first admin

Use **Request access** with your own name, email, and password. Open the confirmation link in the email, return to the app, and sign in. Your account initially remains pending, just like everyone else's. If an email uses a code, the app also accepts it.

In the project's SQL editor (trusted owner access), replace the email below with your verified email and run:

```sql
do $$
declare owner_id uuid;
begin
  select id into owner_id from auth.users
    where lower(email) = lower('REPLACE-WITH-YOUR-EMAIL') and email_confirmed_at is not null;
  if owner_id is null then
    raise exception 'No verified account exists for this email';
  end if;
  update public.member_accounts
    set role = 'admin', status = 'approved', reviewed_at = now(), reviewed_by = owner_id
    where id = owner_id;
end;
$$;
```

Tap **Check status** in the app. As a verified, approved admin you can access every existing app feature. If the old local Admin profile is present, the app offers to copy its data into your signed-in profile. This is explicit, preserves the original, and never overwrites a destination profile. Sign-in on a different device does not transfer workout history.

## 5. Review members

Open **Profile → Registration requests**. New requests appear with name, email, optional message, and email verification status. Approve or decline, then confirm the decision. Requests awaiting email verification cannot be approved. Review history records the outcome and timestamp; the database also records the reviewing admin.

Applicants can sign in while pending or declined but see only their access status and sign-out controls. After approval and email verification, they can complete onboarding and use their own training profile. Members cannot view the approval queue or change roles. Status refreshes when the app becomes active, every minute while active, and through **Check status**.

## Storage and limitations

- Account identity, request message, approval status, and review audit fields are shared online.
- Passwords are managed by Supabase Auth; they are not stored in the app's SQLite database.
- Native session tokens use Expo SecureStore. Web sessions use the Supabase browser storage adapter; sign out on shared devices.
- Body measurements, programs, workout logs, and custom exercises remain in SQLite on each device/browser, keyed to the signed-in account. Sign-out does not delete them. Custom exercise registries and workout sessions reset on account changes.
- Access checks need a network connection. A failed check shows a retry screen instead of granting access from an old local role.
- The original local users and their saved data remain in SQLite. They do not grant online permissions.
- HealthKit/Watch and other previously unfinished fitness features are not added by this account change.

## Verification

Run `npm run test:auth` for database access-policy tests in an isolated in-memory Postgres runtime, and `npm run typecheck` for application checks. No live users or existing device data are modified by these tests.

After setup, test with separate admin and applicant sessions: request access, verify email, confirm pending access is blocked, approve from admin, refresh applicant status, and verify separate profiles. Also test decline, duplicate approval attempts, password recovery, logout/relaunch, and admin data import on a device with old data. Live email delivery and native secure storage require a configured project and devices.

References: [Supabase React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), [Row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/).
