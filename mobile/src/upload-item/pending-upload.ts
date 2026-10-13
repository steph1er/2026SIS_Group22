import type { ItemAnalysis } from './analyse-item-service';

/**
 * Holds the item that was just analysed while the user edits its tags.
 * It lives in memory only and is cleared once the item is saved or discarded.
 */
export type PendingUpload = {
  /** The photo the user took or picked, shown if the cut-out can't be displayed. */
  photoUri: string;
  analysis: ItemAnalysis;
};

let pending: PendingUpload | null = null;

export function setPendingUpload(upload: PendingUpload) {
  pending = upload;
}

export function getPendingUpload(): PendingUpload | null {
  return pending;
}

export function clearPendingUpload() {
  pending = null;
}