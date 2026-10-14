proposed structure:

mobile/
├── app/
│   ├── screens/
│   │   ├── onboarding/     # Raizelle
│   │   ├── profile/        # Priya
│   │   ├── wardrobe/       # Nat
│   │   ├── wishlist/       # Julia
│   │   ├── search/         # Tamara
│   │   ├── outfit-builder/ # Steph
│   │   └── colour-analysis/# Charlene
│   ├── components/         # shared item-card, buttons, etc.
│   ├── navigation/
│   ├── hooks/               # state layer
│   └── services/            # API client calls
├── assets/
├── app.json
└── package.json

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

### Supabase authentication

Copy `.env.example` to `.env.local`, then add the Supabase project URL and publishable key from the project's API settings. Never use a secret or service-role key in the mobile app.

The reusable authentication API is in `src/auth/auth-service.ts`. Screens can call `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `resetPassword`, and `updateUser`. Use `useAuth()` from `src/auth/auth-provider.tsx` to read the current session, user, loading state, or a missing-configuration error. Google provider and redirect setup is documented in `../docs/auth-testing.md`.

Use `authenticatedApiRequest()` from `src/api/authenticated-api-client.ts` for protected NestJS endpoints. It automatically adds the signed-in user's Supabase access token to the request.

The welcome screen now supports email/password signup, login, confirmation
messaging, and sign-out. See [authentication testing](../docs/auth-testing.md)
for Postman token instructions, profile ownership, and the integration checklist.

## Colour Analysis setup

Colour Analysis uses the existing Expo camera, image picker and file-system
packages. No additional mobile package install is needed beyond the normal:

```bash
cd mobile
npm install
```

Copy `.env.example` to the Git-ignored `.env.local` and configure:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ML_SERVICE_URL=http://localhost:8000
```

The Supabase publishable key is intended for the mobile client; never put a
service-role or secret key in an `EXPO_PUBLIC_` variable.

For Expo Go on a physical phone, `localhost` means the phone itself. Use the
development computer's LAN IP for `EXPO_PUBLIC_ML_SERVICE_URL`. On macOS:

```bash
ipconfig getifaddr en0
```

Then use the returned address without committing it, for example:

```dotenv
EXPO_PUBLIC_ML_SERVICE_URL=http://192.168.x.x:8000
```

Start the ML service in a separate terminal:

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Then start the mobile app:

```bash
cd mobile
npx expo start
```

The Face Landmarker model is committed at
`ml-service/models/face_landmarker.task`; no model download is required.
Authenticated result saving requires
`supabase/migrations/20261007040000_create_colour_analysis.sql`. It is already
applied to the team's hosted Supabase project. A fresh or local project should
apply all repository migrations with the normal Supabase workflow:

```bash
npx supabase db push
```

The table keeps one current result per authenticated user and uses RLS to
prevent users reading or changing another account's result.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
