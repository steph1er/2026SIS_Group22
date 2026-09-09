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

The reusable authentication API is in `src/auth/auth-service.ts`. Screens can call `signUp`, `signIn`, `signOut`, `resetPassword`, and `updateUser`. Use `useAuth()` from `src/auth/auth-provider.tsx` to read the current session, user, loading state, or a missing-configuration error.

Use `authenticatedApiRequest()` from `src/api/authenticated-api-client.ts` for protected NestJS endpoints. It automatically adds the signed-in user's Supabase access token to the request.

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
