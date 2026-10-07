import { File, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

import {
  ColourAnalysisRequestError,
  type ColourAnalysisPhoto,
  type ColourAnalysisResult,
} from './types';

const REQUEST_TIMEOUT_MS = 45_000;

function getServiceUrl() {
  const configured = process.env.EXPO_PUBLIC_ML_SERVICE_URL?.trim();
  if (!configured) {
    throw new ColourAnalysisRequestError(
      'Colour analysis is not configured. Add EXPO_PUBLIC_ML_SERVICE_URL to mobile/.env.local.',
    );
  }
  return configured.replace(/\/$/, '');
}

function fileNameFor(photo: ColourAnalysisPhoto) {
  return photo.fileName || `colour-analysis-${Date.now()}.jpg`;
}

function isResult(value: unknown): value is ColourAnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<ColourAnalysisResult>;
  return (
    typeof result.season === 'string' &&
    typeof result.undertone === 'string' &&
    typeof result.confidence === 'number' &&
    Array.isArray(result.palette) &&
    Array.isArray(result.avoidColours) &&
    typeof result.explanation === 'string'
  );
}

function parseResponse(status: number, responseBody: string): ColourAnalysisResult {
  let body: unknown = null;
  try {
    body = JSON.parse(responseBody);
  } catch {
    // Handled below as either an HTTP or response-shape error.
  }

  if (status < 200 || status >= 300) {
    const detail = body && typeof body === 'object' && 'detail' in body
      ? String(body.detail)
      : `Colour analysis failed with server status ${status}.`;
    throw new ColourAnalysisRequestError(detail);
  }
  if (!isResult(body)) {
    throw new ColourAnalysisRequestError('The colour analysis service returned an unexpected result.');
  }
  return body;
}

async function uploadFromWeb(photo: ColourAnalysisPhoto, url: string, signal: AbortSignal) {
  const photoResponse = await globalThis.fetch(photo.uri);
  const form = new FormData();
  form.append('file', await photoResponse.blob(), fileNameFor(photo));
  const response = await globalThis.fetch(url, { method: 'POST', body: form, signal });
  return parseResponse(response.status, await response.text());
}

async function uploadFromNative(photo: ColourAnalysisPhoto, url: string, signal: AbortSignal) {
  const file = new File(photo.uri);
  if (!file.exists) {
    throw new ColourAnalysisRequestError('The selected photo is no longer available. Please take or choose it again.');
  }
  const upload = await file.upload(url, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType: photo.mimeType || file.type || 'image/jpeg',
    sessionType: 'foreground',
    signal,
  });
  return parseResponse(upload.status, upload.body);
}

export async function analyseColourPhoto(photo: ColourAnalysisPhoto): Promise<ColourAnalysisResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${getServiceUrl()}/analyze-colours`;
    return Platform.OS === 'web'
      ? await uploadFromWeb(photo, url, controller.signal)
      : await uploadFromNative(photo, url, controller.signal);
  } catch (error) {
    if (error instanceof ColourAnalysisRequestError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ColourAnalysisRequestError('Colour analysis took too long. Check the ML service and try again.');
    }
    const reason = error instanceof Error && error.message ? ` ${error.message}` : '';
    throw new ColourAnalysisRequestError(`Could not upload the photo to the colour analysis service.${reason}`);
  } finally {
    clearTimeout(timeout);
  }
}
