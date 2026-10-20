# StyleU – 2026SIS Group 22

A mobile wardrobe and styling app. Users photograph their clothes to build a digital wardrobe, get each item tagged automatically by machine learning, plan outfits, discover their personal colour palette, and browse recommended items to add to a wishlist.

## Features

- **Accounts and onboarding**: email sign-up and login with Supabase Auth, followed by a style quiz that sets up the user's profile.
- **Upload an item**: take a photo or choose one from the library. The ML service removes the background and detects the item's category, style and colour, which the user can check and edit before it is saved.
- **My Wardrobe**: browse, search, filter, edit and delete saved items.
- **Outfit builder**: combine wardrobe and wishlist items into outfits and save them.
- **Personal colour analysis**: take a portrait and get a seasonal colour palette with colours to wear and avoid.
- **Recommendations and wishlist**: browse catalogue items recommended using image embeddings, and save favourites to a wishlist.
- **Light and dark themes**.

## Tech stack

| Part | Technology |
| --- | --- |
| Mobile app | React Native, Expo SDK 57, Expo Router, TypeScript |
| Backend API | NestJS 12, TypeScript |
| ML service | Python 3.12, FastAPI, rembg, Marqo-FashionCLIP (open_clip), MediaPipe |
| Database, auth and storage | Supabase (Postgres with pgvector, Auth, Storage) |

## Repository structure

```
2026SIS_Group22/
├── mobile/       # Expo app (screens in app/, API clients in app/services and src/)
├── backend/      # NestJS API: wardrobe, wishlist, catalogue, outfits, brands, auth
├── ml-service/   # FastAPI service: item analysis, embeddings, colour analysis
├── supabase/     # Database migrations and Supabase config
└── docs/         # Project notes, e.g. auth testing
```

## How the parts fit together

```
Mobile app ──► Backend API (NestJS, :3000) ──► Supabase (database + storage)
     │                    │
     │                    └──► ML service (FastAPI, :8000)
     └──► ML service (colour analysis)
```

- The app signs users in directly with Supabase and sends their access token with every backend request.
- Uploading an item sends the photo to the backend (`POST /wardrobes/add`), which calls the ML service, stores the background-removed image and saves the item.
- Colour analysis is called from the app straight to the ML service, and the result is saved to Supabase.

## Team
2026 SIS Group 22: Julia, Natalie, Priya, Raizelle, Stephanie, Tamara and Charlene
