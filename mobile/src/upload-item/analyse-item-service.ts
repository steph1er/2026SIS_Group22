import { File, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

// What POST /analyze-item returns (ml-service/main.py).
export type AnalyseItemResult = {
  category: string;
  category_confidence: number;
  style: string;
  style_confidence: number;
  colour: string;
  embedding: number[];
  image_png_base64: string;
};

type Photo = { uri: string; mimeType?: string | null; fileName?: string | null };

const TIMEOUT_MS = 90_000; // first request is slow while the models warm up

function getServiceUrl() {
  const url = process.env.EXPO_PUBLIC_ML_SERVICE_URL?.trim();
  if (!url) {
    throw new Error('EXPO_PUBLIC_ML_SERVICE_URL is missing from mobile/.env.local. Add it and restart Expo with: npx expo start -c');
  }
  if (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/.test(url)) {
    throw new Error(`EXPO_PUBLIC_ML_SERVICE_URL is ${url}. On a phone, use your Mac's IP instead (run: ipconfig getifaddr en0).`);
  }
  return url.replace(/\/$/, '');
}

function parse(status: number, text: string): AnalyseItemResult {
  let body: any = null;
  try {
    body = JSON.parse(text);
  } catch {
    // not JSON
  }
  if (status < 200 || status >= 300) {
    throw new Error(body?.detail ? String(body.detail) : `The ML service returned an error (status ${status}).`);
  }
  if (!body || typeof body.category !== 'string' || !Array.isArray(body.embedding)) {
    throw new Error('The ML service returned an unexpected result.');
  }
  return body as AnalyseItemResult;
}

export async function analyseItemPhoto(photo: Photo): Promise<AnalyseItemResult> {
  const url = `${getServiceUrl()}/analyze-item`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    if (Platform.OS === 'web') {
      const blob = await (await fetch(photo.uri)).blob();
      const form = new FormData();
      form.append('file', blob, photo.fileName || 'item.jpg');
      const res = await fetch(url, { method: 'POST', body: form, signal: controller.signal });
      return parse(res.status, await res.text());
    }

    const file = new File(photo.uri);
    if (!file.exists) throw new Error('The photo file is missing. Please retake it.');

    const upload = await file.upload(url, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file', // must be "file": the ML endpoint reads UploadFile = File(...) named file
      mimeType: photo.mimeType || 'image/jpeg',
      sessionType: 'foreground',
      signal: controller.signal,
    });
    return parse(upload.status, upload.body);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('The ML service took too long to respond. Check its terminal for errors.');
    }
    if (e instanceof Error && /EXPO_PUBLIC|ML service|photo file/.test(e.message)) throw e;
    // Shows the URL it tried, so you can see if it's wrong.
    throw new Error(`Cannot reach the ML service at ${url}. ${e instanceof Error ? e.message : ''}`);
  } finally {
    clearTimeout(timer);
  }
}