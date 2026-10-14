# ml-service

Python service for the wardrobe app's image analysis. It supports wardrobe
item analysis and personal colour analysis from a portrait.

## Setup

Requires Python 3.12.

```bash
cd ml-service
python3 -m venv venv # py -3.12 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

The first run downloads rembg's segmentation model and
Marqo-FashionCLIP, so do this well before a demo. The MediaPipe Face
Landmarker model used by colour analysis is committed at
`models/face_landmarker.task`. Its source, checksum and license are recorded in
[`models/README.md`](models/README.md).

## Environment

No ML-service environment variables are required for the normal local setup.
The service has safe development defaults for its browser CORS origins and
model path. Optional overrides are documented in `.env.example`:

- `CORS_ORIGINS`: comma-separated browser origins. This applies to Expo web;
  native Expo requests do not use browser CORS.
- `FACE_LANDMARKER_MODEL_PATH`: alternate path to the MediaPipe task bundle.

To use overrides, copy `.env.example` to the ignored `.env` file and include
`--env-file .env` in the Uvicorn command below. These variables are
configuration only and contain no credentials.

## Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

With optional `.env` overrides:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000 --env-file .env
```

`GET /health` returns `{"status": "ok"}` once the models have loaded.

## Test it

From `ml-service/` (use `curl.exe` in PowerShell):

```bash
curl -X POST -F "file=@images-temp/uniqlo_jeans.png" http://localhost:8000/analyze-item
```

Expected response shape:

```json
{
  "category": "jeans",
  "category_confidence": 0.87,
  "style": "casual",
  "style_confidence": 0.42,
  "colour": "denim blue",
  "embedding": [0.0123, -0.0456, ...]
}
```

- Confidences are relative to the other labels in `CATEGORY_LABELS` /
  `STYLE_LABELS`, so they shift if those lists change.
- `embedding` is 512 floats for this model.

### Personal colour analysis

Send one clear portrait to the dedicated endpoint:

```bash
curl -X POST -F "file=@/path/to/portrait.jpg" http://localhost:8000/analyze-colours
```

The endpoint uses MediaPipe Face Landmarker to require exactly one face and
locate the cheeks and forehead. It robustly filters pixels from those skin
regions, measures the representative colour in RGB and CIE Lab, estimates
undertone, depth, chroma and facial contrast, then selects one of twelve
seasonal styling palettes. It rejects photos that are too small, dark,
overexposed, blurry or unevenly lit instead of returning a weak result.

This output is an approximate styling recommendation. Lighting, camera white
balance, makeup and the rule-based season thresholds all affect the answer.

For the Expo app, set the ML service URL in `mobile/.env.local`:

```dotenv
EXPO_PUBLIC_ML_SERVICE_URL=http://localhost:8000
```

Use your computer's LAN address instead of `localhost` when testing on a
physical phone. On macOS, `ipconfig getifaddr en0` usually prints that address.
Android emulators normally reach the host at `10.0.2.2`.

## Saved colour-analysis results

Authenticated results are stored by the mobile app in Supabase. The required
schema is tracked in
`supabase/migrations/20261007040000_create_colour_analysis.sql`. It stores one
current result per `auth.users` account and enables row-level security so users
can only select, insert or update their own result. The migration is already
applied to the team's hosted project; fresh or local Supabase environments
must apply the repository migrations normally.

## Storing results in Supabase

Map the response onto `wardrobe_items` when saving:

- `category` → `clothing_category`
- `colour` → `colour: [colour]` (`text[]`)
- `style` → `style: [style]` (`text[]`)
- `embedding` → `embedding` (`vector(512)`, added in
  `supabase/migrations/20261001000000_add_wardrobe_item_embeddings.sql`)

## Calling this from the NestJS backend

`WardrobeService.addItem()` in `backend/src/wardrobe/wardrobe.service.ts`
is still a stub. Once the image is uploaded, it should call this service
and save the returned fields on the item. Node's built-in `fetch` and
`FormData` are enough, so no extra packages are needed:

```typescript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';

async analyzeItem(imageBuffer: Buffer, filename: string) {
  const form = new FormData();
  form.append('file', new Blob([imageBuffer]), filename);

  const res = await fetch(`${ML_SERVICE_URL}/analyze-item`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new HttpException('ML service failed', HttpStatus.BAD_GATEWAY);
  }
  return res.json();
}
```

Add `ML_SERVICE_URL=http://localhost:8000` to the backend's `.env`.

## Suggested build order

1. Get `/analyze-item` returning sensible results on the photos in
   `images-temp/`, and adjust `CATEGORY_LABELS`, `STYLE_LABELS` and
   `NAMED_COLOURS` to match what the app needs to support.
2. Apply the `embedding` column migration (see above).
3. Wire `addItem()` to call this service and store the results against
   the wardrobe item.
4. Once embeddings are stored, outfit matching becomes a `pgvector`
   similarity query against `wardrobe_items`, with no new model needed.
5. Shopping recommendations are separate work. Personal colour analysis is
   provided by `/analyze-colours` and is saved directly by the authenticated
   mobile client.
