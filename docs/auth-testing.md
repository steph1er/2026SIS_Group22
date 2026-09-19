# Authentication handoff and testing

## Setup

1. Configure `mobile/.env.local` and `backend/.env` using their `.env.example`
   files. Both must use the same Supabase project. Use the publishable key for
   these tests, never a secret/service-role key as a user bearer token.
2. Apply the checked-in migrations to a development Supabase project using
   `npx supabase db push` from the repository root after linking that project.
   Review the target before running: this changes the linked database.
3. Start the mobile app (`npm run web` in `mobile`). Create a test account using
   an email you control. Email confirmation is currently disabled for
   development, so signup keeps the new user signed in and opens the onboarding
   quiz. To test login, sign out from Settings and log in with the same
   credentials. Login and a restored session both read `onboarding_completed`
   from the user's profile (`profiles.user_id = user.id`): `true` opens the home
   screen, `false` opens onboarding.

### Auth redirects

In the hosted Supabase dashboard, open **Authentication → URL Configuration**.
Use `http://localhost:8081` as the development Site URL and allow these redirect
URLs:

```text
http://localhost:8081/**
http://127.0.0.1:8081/**
mobile://**
exp://**
```

Google OAuth redirects to `/auth/callback`, where the app saves the session and
returns the user to the home screen. The web development server must still be
running when testing a localhost callback. Use a deployed HTTPS URL for shared
or production testing and add that URL to the allow list.

The branded confirmation email is stored at
`supabase/templates/confirmation.html`. Local Supabase uses it through
`config.toml`. For the hosted project, copy that HTML into **Authentication →
Email Templates → Confirm signup** and use `Verify your StyleU email` as the
subject. The button uses Supabase's `{{ .ConfirmationURL }}` value, which verifies
the address before opening the app callback.

### Google sign-in

Google sign-in uses the same `/auth/callback` route. To enable it for the hosted
project:

1. In Google Cloud, create an OAuth 2.0 client with application type **Web
   application**.
2. Add this Google authorized redirect URI:

   ```text
   https://kglybxcngrruskhuzqsz.supabase.co/auth/v1/callback
   ```

3. In Supabase, open **Authentication → Sign In / Providers → Google**, enter
   the Google client ID and client secret, enable the provider, and save it.
4. Keep the web, `mobile://**`, and `exp://**` URLs above in Supabase's redirect
   allow list so Supabase can return users to the browser, a development build,
   or Expo Go.

Never commit the Google client secret. A Google account that signs in for the
first time is registered automatically when project signups are enabled.

The profile migration preserves `profiles.id` and adds unique `profiles.user_id`
referencing `auth.users.id`. New signups receive a profile automatically; existing
auth accounts are backfilled. Unlinked legacy profiles are retained but hidden by
ownership policies. Map them explicitly only when ownership is known; do not infer
ownership from display names. Auth user IDs and profile IDs are distinct.

## Obtain a token without the UI (Postman)

Create a POST request to `{{supabase_url}}/auth/v1/token?grant_type=password`.
Set Authorization to **No Auth**, and add headers:

```text
apikey: {{supabase_publishable_key}}
Content-Type: application/json
```

Use a raw JSON body with your confirmed test account:

```json
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

On success, the response contains `access_token`, `expires_in`, and `user.id`.
Copy `access_token` into a local/private Postman variable. Do not commit or share
tokens/passwords or export them in a collection. Sign in again when it expires.

Start the backend (`npm install`, then `npm run start:dev` in `backend`). Send
`GET http://localhost:3000/wardrobes` with Authorization → Bearer Token set to
the access token. The current wardrobe response is a placeholder, so success
proves token acceptance, not database ownership filtering.

## Passing the authenticated identity to wardrobe

The guard validates the token and attaches the Supabase user. In a guarded
controller, import `AuthenticatedUser` and Supabase's `User` type and use:

```ts
getWardrobe(@AuthenticatedUser() user: User) {
  // Pass user.id to the wardrobe service and scope all queries to that owner.
}
```

The auth contract is the verified `user.id`. Wardrobe owns how that ID is used in
its service and database queries. If it needs a profile, it can look one up using
`profiles.user_id = user.id`. It should not accept a request-body user ID as proof
of identity. Mobile requests can use the existing
`authenticatedApiRequest('/wardrobes')` helper after login.

## Verification checklist

- Email signup keeps the user signed in and opens onboarding, without sending a
  confirmation email.
- A newly registered email account can log in immediately.
- Wrong passwords show an error; correct login shows the account email.
- Reload restores the session; sign out returns to the form.
- Login as a user with `onboarding_completed = true` opens the home screen; as a
  user with `false` it opens onboarding.
- Restarting the app mid-onboarding (signed in, not finished) reopens onboarding;
  restarting after finishing reopens the home screen.
- A profile with no row opens the home screen (with a console warning); a failed
  profile check shows an error and a retry option instead of navigating.
- Google sign-in is not yet checked against `onboarding_completed`; it still opens
  the home screen.
- A valid token reaches `/wardrobes`; missing/invalid tokens return 401.
- In Supabase, the account has one profile with matching `user_id`.
- Using two users' tokens against Supabase's REST `profiles` endpoint (with the
  publishable `apikey` header), each user sees only their own profile and cannot
  insert/update a row owned by the other user.

Local type checking does not verify remote credentials, migrations, or RLS. Run
this checklist against the development project before reporting live auth ready.
