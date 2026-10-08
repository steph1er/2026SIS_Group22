// Sends a clothing photo to the ML service's /analyze-item endpoint and returns
// the guessed tags. Based on src/colour-analysis/colour-analysis-service.ts.
//
// Put this file at: mobile/app/services/wardrobe/analyse-item-service.ts

import { File, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

// Background removal + CLIP on a CPU is slow, so allow up to a minute.
const REQUEST_TIMEOUT_MS = 60_000;

// What we send: a photo from the camera or the gallery.
export type AnalyseItemPhoto = {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string | null;
  mimeType?: string | null;
};

// What the ML service sends back (see ml-service/README.md).
export type AnalyseItemResult = {
  category: string;
  category_confidence: number;
  style: string;
  style_confidence: number;
  colour: string;
  embedding: number[];
  // Not returned yet. Will hold the cropped, background-free PNG once the
  // ML service adds it.
  image_base64?: string;
};

export class AnalyseItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalyseItemError';
  }
}

function getServiceUrl() {
  const configured = process.env.EXPO_PUBLIC_ML_SERVICE_URL?.trim();
  if (!configured) {
    throw new AnalyseItemError(
      'Item analysis is not configured. Add EXPO_PUBLIC_ML_SERVICE_URL to mobile/.env.local.',
    );
  }
  return configured.replace(/\/$/, '');
}

function fileNameFor(photo: AnalyseItemPhoto) {
  return photo.fileName || `item-${Date.now()}.jpg`;
}

// Checks the response really has the fields we rely on.
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

function parseResponse(status: number, responseBody: string): AnalyseItemResult {
  let body: unknown = null;
  try {
    body = JSON.parse(responseBody);
  } catch {
    // Handled below as either an HTTP or response-shape error.
  }

  if (status < 200 || status >= 300) {
    const detail =
      body && typeof body === 'object' && 'detail' in body
        ? String(body.detail)
        : `Item analysis failed with server status ${status}.`;
    throw new AnalyseItemError(detail);
  }
  if (!isResult(body)) {
    throw new AnalyseItemError('The item analysis service returned an unexpected result.');
  }
  return body;
}

// Expo web: read the photo into a Blob and send it as multipart form data.
async function uploadFromWeb(photo: AnalyseItemPhoto, url: string, signal: AbortSignal) {
  const photoResponse = await globalThis.fetch(photo.uri);
  const form = new FormData();
  form.append('file', await photoResponse.blob(), fileNameFor(photo));
  const response = await globalThis.fetch(url, { method: 'POST', body: form, signal });
  return parseResponse(response.status, await response.text());
}

// iOS / Android: upload the photo file straight from the device.
async function uploadFromNative(photo: AnalyseItemPhoto, url: string, signal: AbortSignal) {
  const file = new File(photo.uri);
  if (!file.exists) {
    throw new AnalyseItemError(
      'The selected photo is no longer available. Please take or choose it again.',
    );
  }
  const upload = await file.upload(url, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'file', // must match `file: UploadFile` in main.py
    mimeType: photo.mimeType || file.type || 'image/jpeg',
    sessionType: 'foreground',
    signal,
  });
  return parseResponse(upload.status, upload.body);
}

// ---- Fake ML for testing ----
// Set EXPO_PUBLIC_MOCK_ML=true in mobile/.env.local to skip the real ML service.
// analyseItemPhoto() then waits a moment and returns made-up tags, so the rest of
// the upload flow can be tested without the ML running.
const USE_MOCK_ML = process.env.EXPO_PUBLIC_MOCK_ML === 'true';

const MOCK_RESULTS: Omit<AnalyseItemResult, 'embedding'>[] = [
  { category: 'jeans', category_confidence: 0.87, style: 'casual', style_confidence: 0.42, colour: 'denim blue' },
  { category: 'dress', category_confidence: 0.91, style: 'formal', style_confidence: 0.55, colour: 'plum' },
  { category: 'hoodie', category_confidence: 0.78, style: 'streetwear', style_confidence: 0.61, colour: 'grey' },
];

async function mockAnalyse(): Promise<AnalyseItemResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // pretend to think
  const pick = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
  // The real embedding is 512 numbers; any 512 numbers are fine for testing.
  return { ...pick, embedding: Array.from({ length: 512 }, () => 0.01) };
}

export async function analyseItemPhoto(photo: AnalyseItemPhoto): Promise<AnalyseItemResult> {
  if (USE_MOCK_ML) return mockAnalyse();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${getServiceUrl()}/analyze-item`;
    return Platform.OS === 'web'
      ? await uploadFromWeb(photo, url, controller.signal)
      : await uploadFromNative(photo, url, controller.signal);
  } catch (error) {
    if (error instanceof AnalyseItemError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AnalyseItemError('Analysing the item took too long. Check the ML service and try again.');
    }
    const reason = error instanceof Error && error.message ? ` ${error.message}` : '';
    throw new AnalyseItemError(`Could not upload the photo to the item analysis service.${reason}`);
  } finally {
    clearTimeout(timeout);
  }
}