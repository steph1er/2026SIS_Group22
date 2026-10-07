# ml-service

Python service for the wardrobe app's image analysis. It supports wardrobe
item analysis and personal colour analysis from a portrait.

## Setup

Requires Python 3.9+.

```bash
cd ml-service
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

The first run downloads rembg's segmentation model and
Marqo-FashionCLIP, so do this well before a demo. The MediaPipe Face
Landmarker model used by colour analysis is already stored at
`models/face_landmarker.task` and came from Google's official
`mediapipe-assets/face_landmarker_v2.task` release.

## Run

```bash
uvicorn main:app --reload --port 8000
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
physical phone. Android emulators normally reach the host at `10.0.2.2`.

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
5. Shopping recommendations and personal colour analysis are separate,
   later pieces. They can reuse this service but don't depend on it.
