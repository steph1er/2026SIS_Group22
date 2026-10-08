// Sends a clothing photo to the ML service's POST /analyze-item (ml-service/main.py)
// as multipart form data, and returns what it finds.

import { Platform } from 'react-native';

import type { UploadPhoto } from './prep-image';

// Background removal + CLIP on a CPU can take 5-20 seconds.
const REQUEST_TIMEOUT_MS = 60_000;

// What /analyze-item returns.
export type AnalyseItemResult = {
  category: string;
  category_confidence: number;
  style: string;
  style_confidence: number;
  colour: string;
  embedding: number[];
};

function getServiceUrl() {
  const configured = process.env.EXPO_PUBLIC_ML_SERVICE_URL?.trim();
  if (!configured) {
    throw new Error('Item analysis is not configured. Add EXPO_PUBLIC_ML_SERVICE_URL to mobile/.env.local.');
  }
  return configured.replace(/\/$/, '');
}

function isResult(value: unknown): value is AnalyseItemResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<AnalyseItemResult>;
  return (
    typeof result.category === 'string' &&
    typeof result.category_confidence === 'number' &&
    typeof result.style === 'string' &&
    typeof result.style_confidence === 'number' &&
    typeof result.colour === 'string' &&
    Array.isArray(result.embedding)
  );
}

// ---- Fake ML for testing ----
// Set EXPO_PUBLIC_MOCK_ML=true in mobile/.env.local while the ML service isn't running.
// analyseItemPhoto() then waits 2 seconds and returns made-up results.
const USE_MOCK_ML = process.env.EXPO_PUBLIC_MOCK_ML === 'true';

async function mockAnalyse(): Promise<AnalyseItemResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    category: 'jeans',
    category_confidence: 0.87,
    style: 'casual',
    style_confidence: 0.42,
    colour: 'denim blue',
    embedding: Array.from({ length: 512 }, () => 1 / Math.sqrt(512)),
  };
}

export async function analyseItemPhoto(photo: UploadPhoto): Promise<AnalyseItemResult> {
  if (USE_MOCK_ML) return mockAnalyse();

  // The field name 'file' must match `file: UploadFile` in main.py.
  const form = new FormData();
  if (Platform.OS === 'web') {
    form.append('file', await (await fetch(photo.uri)).blob(), 'item.jpg');
  } else {
    form.append('file', { uri: photo.uri, name: 'item.jpg', type: 'image/jpeg' } as unknown as Blob);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = `${getServiceUrl()}/analyze-item`;

  let response: Response;
  try {
    // No Content-Type header: fetch sets multipart/form-data with the boundary itself.
    response = await fetch(url, { method: 'POST', body: form, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Analysing the item took too long. Check the ML service and try again.');
    }
    throw new Error(`Can't reach the ML service at ${url}. Make sure it is running.`);
  } finally {
    clearTimeout(timeout);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Item analysis failed with server status ${response.status}.`);
  }
  if (!isResult(body)) {
    throw new Error('The ML service returned an unexpected result.');
  }
  return body;
}