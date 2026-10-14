"""Face-landmark guided skin sampling and seasonal colour estimation."""

from __future__ import annotations

import colorsys
import io
import math
import os
import threading
from pathlib import Path
from typing import Any

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from PIL import Image, ImageOps, UnidentifiedImageError

from .palettes import PALETTES, classify_season


MODEL_PATH = Path(
    os.getenv(
        "FACE_LANDMARKER_MODEL_PATH",
        Path(__file__).resolve().parent.parent / "models" / "face_landmarker.task",
    )
)
MAX_IMAGE_SIDE = 1600
MIN_IMAGE_SIDE = 320
MIN_FACE_AREA_RATIO = 0.055
MIN_SAMPLES_PER_REGION = 80


class AnalysisError(ValueError):
    """An image problem the user can fix by choosing a different photo."""


_landmarker: vision.FaceLandmarker | None = None
_landmarker_lock = threading.Lock()


def _get_landmarker() -> vision.FaceLandmarker:
    global _landmarker
    if _landmarker is None:
        if not MODEL_PATH.exists():
            raise RuntimeError(f"MediaPipe model is missing at {MODEL_PATH}")
        options = vision.FaceLandmarkerOptions(
            base_options=python.BaseOptions(model_asset_path=str(MODEL_PATH)),
            running_mode=vision.RunningMode.IMAGE,
            num_faces=5,
            min_face_detection_confidence=0.55,
            min_face_presence_confidence=0.55,
            min_tracking_confidence=0.55,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
        )
        _landmarker = vision.FaceLandmarker.create_from_options(options)
    return _landmarker


def _read_image(image_bytes: bytes) -> np.ndarray:
    try:
        image = ImageOps.exif_transpose(Image.open(io.BytesIO(image_bytes))).convert("RGB")
    except (UnidentifiedImageError, OSError) as error:
        raise AnalysisError("This file is not a readable photo. Please choose a JPEG or PNG image.") from error

    if min(image.size) < MIN_IMAGE_SIDE:
        raise AnalysisError("This photo is too small for a reliable analysis. Please choose a clearer, higher-resolution photo.")

    if max(image.size) > MAX_IMAGE_SIDE:
        image.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE), Image.Resampling.LANCZOS)
    return np.asarray(image)


def _detect_landmarks(rgb: np.ndarray) -> list[Any]:
    image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
    with _landmarker_lock:
        result = _get_landmarker().detect(image)
    faces = result.face_landmarks
    if not faces:
        raise AnalysisError("No face detected. Please take a clear photo with your face visible.")
    if len(faces) > 1:
        raise AnalysisError("Multiple faces detected. Please use a photo containing only you.")
    return faces[0]


def _point(landmarks: list[Any], index: int, width: int, height: int) -> tuple[float, float]:
    landmark = landmarks[index]
    return landmark.x * width, landmark.y * height


def _face_bounds(landmarks: list[Any], width: int, height: int) -> tuple[int, int, int, int]:
    xs = np.array([landmark.x for landmark in landmarks]) * width
    ys = np.array([landmark.y for landmark in landmarks]) * height
    x0, x1 = int(np.clip(xs.min(), 0, width - 1)), int(np.clip(xs.max(), 1, width))
    y0, y1 = int(np.clip(ys.min(), 0, height - 1)), int(np.clip(ys.max(), 1, height))
    return x0, y0, x1, y1


def _validate_face_quality(rgb: np.ndarray, landmarks: list[Any]) -> tuple[int, int, int, int, float]:
    height, width = rgb.shape[:2]
    x0, y0, x1, y1 = _face_bounds(landmarks, width, height)
    face_width, face_height = x1 - x0, y1 - y0
    area_ratio = (face_width * face_height) / float(width * height)
    if area_ratio < MIN_FACE_AREA_RATIO:
        raise AnalysisError("Your face is too far away. Please retake the photo with your face filling more of the frame.")
    if min(face_width, face_height) < 150:
        raise AnalysisError("Your face is too small for reliable colour sampling. Please take a closer photo.")

    crop = rgb[y0:y1, x0:x1]
    grey = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY)
    mean_light = float(grey.mean())
    low, high = np.percentile(grey, [5, 95])
    if mean_light < 48 or high < 105:
        raise AnalysisError("This photo is too dark for meaningful colour analysis. Please retake it in natural daylight.")
    if mean_light > 220 or low > 175:
        raise AnalysisError("This photo is overexposed. Please retake it away from harsh direct light.")

    blur_score = float(cv2.Laplacian(grey, cv2.CV_64F).var())
    if blur_score < 35:
        raise AnalysisError("This photo is too blurry for meaningful colour analysis. Please hold the camera steady and retake it.")
    return x0, y0, x1, y1, blur_score


def _ellipse_pixels(
    rgb: np.ndarray,
    center: tuple[float, float],
    radius_x: float,
    radius_y: float,
) -> np.ndarray:
    height, width = rgb.shape[:2]
    cx, cy = center
    x0, x1 = max(0, int(cx - radius_x)), min(width, int(cx + radius_x + 1))
    y0, y1 = max(0, int(cy - radius_y)), min(height, int(cy + radius_y + 1))
    yy, xx = np.ogrid[y0:y1, x0:x1]
    mask = ((xx - cx) / max(radius_x, 1)) ** 2 + ((yy - cy) / max(radius_y, 1)) ** 2 <= 1
    return rgb[y0:y1, x0:x1][mask]


def _robust_skin_pixels(pixels: np.ndarray) -> np.ndarray:
    if len(pixels) == 0:
        return pixels
    pixels = pixels.astype(np.uint8)
    neither_clipped = np.all((pixels > 12) & (pixels < 248), axis=1)
    pixels = pixels[neither_clipped]
    if len(pixels) == 0:
        return pixels

    ycrcb = cv2.cvtColor(pixels.reshape(-1, 1, 3), cv2.COLOR_RGB2YCrCb).reshape(-1, 3)
    skin_mask = (
        (ycrcb[:, 0] > 35)
        & (ycrcb[:, 1] >= 120)
        & (ycrcb[:, 1] <= 190)
        & (ycrcb[:, 2] >= 65)
        & (ycrcb[:, 2] <= 155)
    )
    # The chroma gate rejects hair/background, but broad skin-tone support takes priority.
    if int(skin_mask.sum()) >= max(MIN_SAMPLES_PER_REGION, int(len(pixels) * 0.25)):
        pixels = pixels[skin_mask]

    lab = cv2.cvtColor(pixels.reshape(-1, 1, 3).astype(np.float32) / 255.0, cv2.COLOR_RGB2LAB).reshape(-1, 3)
    median = np.median(lab, axis=0)
    distances = np.linalg.norm(lab - median, axis=1)
    distance_median = float(np.median(distances))
    mad = float(np.median(np.abs(distances - distance_median)))
    cutoff = distance_median + max(2.8 * mad, 4.0)
    luminance_low, luminance_high = np.percentile(lab[:, 0], [8, 92])
    keep = (distances <= cutoff) & (lab[:, 0] >= luminance_low) & (lab[:, 0] <= luminance_high)
    return pixels[keep]


def _sample_skin_regions(rgb: np.ndarray, landmarks: list[Any]) -> tuple[np.ndarray, float]:
    height, width = rgb.shape[:2]
    x0, y0, x1, y1 = _face_bounds(landmarks, width, height)
    face_width, face_height = x1 - x0, y1 - y0

    left_cheek = _point(landmarks, 205, width, height)
    right_cheek = _point(landmarks, 425, width, height)
    forehead_top = _point(landmarks, 10, width, height)
    forehead_lower = _point(landmarks, 151, width, height)
    forehead = (
        forehead_top[0] * 0.35 + forehead_lower[0] * 0.65,
        forehead_top[1] * 0.35 + forehead_lower[1] * 0.65,
    )
    regions = (
        _ellipse_pixels(rgb, left_cheek, face_width * 0.055, face_height * 0.055),
        _ellipse_pixels(rgb, right_cheek, face_width * 0.055, face_height * 0.055),
        _ellipse_pixels(rgb, forehead, face_width * 0.075, face_height * 0.04),
    )
    filtered = [_robust_skin_pixels(region) for region in regions]
    if any(len(region) < MIN_SAMPLES_PER_REGION for region in filtered):
        raise AnalysisError("We could not sample enough clear skin. Remove hair from your face and retake the photo in even natural light.")

    region_lab = [
        np.median(
            cv2.cvtColor(region.reshape(-1, 1, 3).astype(np.float32) / 255.0, cv2.COLOR_RGB2LAB).reshape(-1, 3),
            axis=0,
        )
        for region in filtered
    ]
    disagreement = max(float(np.linalg.norm(a - b)) for index, a in enumerate(region_lab) for b in region_lab[index + 1 :])
    if disagreement > 27:
        raise AnalysisError("Lighting across your face is too uneven for a reliable result. Please retake the photo in soft, even daylight.")
    return np.concatenate(filtered, axis=0), disagreement


def _round(value: float) -> float:
    return round(float(value), 1)


def _characterise(pixels: np.ndarray, face_crop: np.ndarray) -> dict[str, Any]:
    representative_rgb = np.median(pixels, axis=0)
    lab_pixels = cv2.cvtColor(pixels.reshape(-1, 1, 3).astype(np.float32) / 255.0, cv2.COLOR_RGB2LAB).reshape(-1, 3)
    representative_lab = np.median(lab_pixels, axis=0)
    lightness, lab_a, lab_b = (float(value) for value in representative_lab)
    red, green, blue = (float(channel) / 255.0 for channel in representative_rgb)
    hue, saturation, _ = colorsys.rgb_to_hsv(red, green, blue)
    hue_degrees = hue * 360.0
    chroma_value = math.hypot(lab_a, lab_b)

    # Skin undertone is an estimate from yellow/red balance after landmark-guided sampling.
    # The neutral band is intentionally wide to avoid overstating uncertain warm/cool calls.
    warmth_score = 0.58 * ((lab_b - 15.0) / 10.0) + 0.28 * ((lab_a - 15.0) / 10.0)
    if hue_degrees < 10 or hue_degrees > 55:
        warmth_score -= 0.25
    undertone = "Warm" if warmth_score > 0.38 else "Cool" if warmth_score < -0.28 else "Neutral"

    if lightness >= 70:
        depth = "Light"
    elif lightness < 48:
        depth = "Deep"
    elif lightness < 58:
        depth = "Medium-deep"
    else:
        depth = "Medium"

    if chroma_value < 20 or saturation < 0.22:
        chroma = "Soft"
    elif chroma_value >= 31 and saturation >= 0.32:
        chroma = "Bright"
    else:
        chroma = "Balanced"

    face_lab = cv2.cvtColor(face_crop.astype(np.float32) / 255.0, cv2.COLOR_RGB2LAB)
    face_lightness = face_lab[:, :, 0]
    contrast_value = float(np.percentile(face_lightness, 90) - np.percentile(face_lightness, 10))
    contrast = "High" if contrast_value >= 52 else "Low" if contrast_value < 32 else "Medium"

    rgb_int = np.clip(np.rint(representative_rgb), 0, 255).astype(int)
    return {
        "undertone": undertone,
        "depth": depth,
        "chroma": chroma,
        "contrast": contrast,
        "contrastValue": _round(contrast_value),
        "skinColour": {
            "hex": "#{:02X}{:02X}{:02X}".format(*rgb_int),
            "rgb": [int(value) for value in rgb_int],
        },
        "lab": {"lightness": _round(lightness), "a": _round(lab_a), "b": _round(lab_b)},
        "hue": _round(hue_degrees),
        "saturation": _round(saturation * 100),
    }


def analyze_colour_image(image_bytes: bytes) -> dict[str, Any]:
    """Analyse a single portrait and return an estimated twelve-season recommendation."""
    rgb = _read_image(image_bytes)
    landmarks = _detect_landmarks(rgb)
    x0, y0, x1, y1, blur_score = _validate_face_quality(rgb, landmarks)
    skin_pixels, region_disagreement = _sample_skin_regions(rgb, landmarks)
    measurements = _characterise(skin_pixels, rgb[y0:y1, x0:x1])

    season = classify_season(
        measurements["undertone"],
        measurements["depth"],
        measurements["chroma"],
        measurements["contrast"],
    )
    palette = PALETTES[season]
    quality_score = min(1.0, len(skin_pixels) / 1500.0)
    blur_quality = min(1.0, blur_score / 180.0)
    agreement_quality = max(0.0, 1.0 - region_disagreement / 27.0)
    confidence = round(0.48 + 0.18 * quality_score + 0.12 * blur_quality + 0.1 * agreement_quality, 2)

    return {
        "season": season,
        "undertone": measurements["undertone"],
        "skinColour": measurements["skinColour"],
        "confidence": min(confidence, 0.88),
        "palette": [{"name": name, "hex": hex_value} for name, hex_value in palette.colours],
        "avoidColours": [{"name": name, "hex": hex_value} for name, hex_value in palette.avoid],
        "characteristics": {
            "depth": measurements["depth"],
            "chroma": measurements["chroma"],
            "contrast": measurements["contrast"],
            "lightness": measurements["lab"]["lightness"],
            "lab": measurements["lab"],
            "hue": measurements["hue"],
            "saturation": measurements["saturation"],
        },
        "explanation": palette.suggestion,
        "disclaimer": "This is an estimated styling recommendation from one photo, not a scientific or medical assessment.",
    }
