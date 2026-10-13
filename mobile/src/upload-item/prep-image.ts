import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker'; 

// A photo from the camera (takePictureAsync) or the gallery (launchImageLibraryAsync).
export type UploadPhoto = {
  uri: string;
  width?: number;
  height?: number;
};

const MAX_SIDE = 1024;

/**
 * Shrinks a photo so its longest side is at most 1024px and saves it as a JPEG.
 * Smaller photos upload faster, make the ML service faster, and use less storage.
 * Photos that are already small are only re-saved as JPEG, not enlarged.
 */
export async function preparePhotoForUpload(photo: UploadPhoto): Promise<UploadPhoto> {
  const context = ImageManipulator.manipulate(photo.uri);

  // Camera and gallery photos normally include their size; measure it if not.
  let { width, height } = photo;
  if (!width || !height) {
    const original = await context.renderAsync();
    width = original.width;
    height = original.height;
    context.reset();
  }

  if (Math.max(width, height) > MAX_SIDE) {
    // Resize the longest side; the other side keeps the aspect ratio.
    context.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }

  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  return { uri: result.uri, width: result.width, height: result.height };
}
