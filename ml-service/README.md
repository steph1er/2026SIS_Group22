# ml-service

Python service for the wardrobe app's image analysis. Given a clothing
photo, it strips the background, identifies the category and dominant
colour, and returns an embedding vector for later similarity search
(outfit matching, recommendations).

## Setup

```bash
cd ml-service
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

The first run downloads two sets of model weights (rembg's segmentation
model and Marqo-FashionCLIP), roughly 1-2 GB combined. Do this well
before a demo

## Run

```bash
uvicorn main:app --reload --port 8000
```

## Test it

```bash
curl.exe -X POST -F "file=@ml-service\uniqlo_jeans.png" http://localhost:8000/analyze-item

```

Expected response shape:

```json
{
  "category": "t-shirt",
  "category_confidence": 0.87,
  "colour": "navy",
  "embedding": [0.0123, -0.0456, ...]
}
```

Check `len(embedding)` on a real response and confirm it matches the
`vector(N)` dimension used in the Supabase schema (see
`supabase/wardrobe_items.sql`). It should be 512 for this model, but
worth verifying before wiring up storage.

## Calling this from the NestJS backend

The upload handler in the backend should call this service after the
image lands in Supabase Storage, then save the returned fields
alongside the item record.

```typescript
// wardrobe.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

@Injectable()
export class WardrobeService {
  async analyzeItem(imageBuffer: Buffer, filename: string) {
    const form = new FormData();
    form.append('file', imageBuffer, filename);

    const { data } = await axios.post(
      `${ML_SERVICE_URL}/analyze-item`,
      form,
      { headers: form.getHeaders() },
    );

    return data; // { category, colour, embedding, category_confidence }
  }
}
```

Add `ML_SERVICE_URL=http://localhost:8000` to the backend's `.env` so
it's not hardcoded.

## Suggested build order

1. Get `/analyze-item` returning sensible results on a handful of test
   photos, adjust `CATEGORY_LABELS` and `NAMED_COLOURS` to match what
   the app actually needs to support.
2. Wire the NestJS upload flow to call this service and store the
   result (category, colour, embedding) against the wardrobe item.
3. Once embeddings are being stored for a few items, outfit matching
   becomes a `pgvector` similarity query
   against `wardrobe_items`, no new model needed.
4. Shopping recommendations and colour analysis (personal palette) are
   separate, later pieces, they can reuse this service but don't block
   on it.