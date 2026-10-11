"""
ml-service: image analysis for wardrobe uploads

Given a clothing photo, this service:
1. Removes the background (rembg)
2. Classifies the item's category (Marqo-FashionCLIP)
3. Extracts a dominant colour name (OpenCV)
4. Returns an embedding

"""

import base64
import io
import os

import cv2
import numpy as np
import open_clip
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from matplotlib.colors import XKCD_COLORS, to_rgb
from PIL import Image
from rembg import remove

from colour_analysis import AnalysisError, analyze_colour_image

app = FastAPI(title="Wardrobe ML Service")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MAX_COLOUR_PHOTO_BYTES = 12 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

MODEL_NAME = "hf-hub:Marqo/marqo-fashionCLIP"
model, _, preprocess = open_clip.create_model_and_transforms(MODEL_NAME)
tokenizer = open_clip.get_tokenizer(MODEL_NAME)
model.eval()

CATEGORY_LABELS = [
    "t-shirt", "shirt", "blouse", "sweater", "hoodie", "jacket", "coat",
    "dress", "skirt", "jeans", "trousers", "shorts", "sweatpants",
    "sweatshorts", "socks", "sneakers", "boots", "sandals", "heels",
    "bag", "hat", "beanie", "scarf", "belt",
]

STYLE_LABELS = [
    "streetwear", "coquette", "workwear", "casual", "goth", "alternative",
    "formal", "athleisure", "preppy", "minimalist",
]

# ~950 crowd-sourced names (XKCD colour survey, shipped with matplotlib), matched by nearest Lab distance.
NAMED_COLOURS = {
    name.removeprefix("xkcd:"): tuple(round(c * 255) for c in to_rgb(hex_code))
    for name, hex_code in XKCD_COLORS.items()
}


def zero_shot_classify(image: Image.Image, labels: list[str]) -> tuple[str, float]:
    """Return the best-matching label and its softmax confidence relative to the other labels."""
    image_input = preprocess(image).unsqueeze(0)
    text_inputs = tokenizer(labels)
    with torch.no_grad():
        image_features = model.encode_image(image_input, normalize=True)
        text_features = model.encode_text(text_inputs, normalize=True)
        probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)
    best_idx = int(probs.argmax())
    return labels[best_idx], float(probs[0, best_idx])


def get_embedding(image: Image.Image) -> list[float]:
    """Return the normalised image embedding used for outfit matching."""
    image_input = preprocess(image).unsqueeze(0)
    with torch.no_grad():
        features = model.encode_image(image_input, normalize=True)
    return features[0].tolist()


def rgb_to_lab(rgb) -> np.ndarray:
    """Convert a 0-255 RGB triple to CIE Lab for perceptual distance."""
    pixel = np.array(rgb, dtype=np.float32).reshape(1, 1, 3) / 255.0
    return cv2.cvtColor(pixel, cv2.COLOR_RGB2LAB).reshape(3)


def _saturation(rgb) -> float:
    hi, lo = max(rgb), min(rgb)
    return 0.0 if hi == 0 else (hi - lo) / hi


# Wardrobe-friendly names. Each XKCD name is reduced to its final word ("faded red" -> "red"),
# with a light/dark prefix added from the pixel's lightness; names that don't end in one of these words are dropped.
COLOUR_FAMILIES = {
    "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "teal",
    "lime", "rose", "violet", "tan", "turquoise", "lavender", "magenta", "lilac",
    "olive", "beige", "gold", "peach", "salmon", "mauve", "khaki", "mint", "sage",
    "mustard", "plum", "navy", "maroon", "cream", "coral", "burgundy", "chocolate",
}
SHADEABLE = {"red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "teal"}
LIGHT_L, DARK_L = 72.0, 30.0  # Lab lightness cut-offs for adding a light/dark prefix


def simplify_colour_name(name: str) -> str | None:
    words = name.split()
    if words[-2:] == ["navy", "blue"]:
        return "navy"
    return words[-1] if words[-1] in COLOUR_FAMILIES else None


# Neutral-looking names are reserved for the brightness rules below.
_candidates = [
    (simple, rgb)
    for name, rgb in NAMED_COLOURS.items()
    if (simple := simplify_colour_name(name)) and _saturation(rgb) >= 0.12
]
CHROMATIC_NAMES = [name for name, _ in _candidates]
CHROMATIC_LAB = np.stack([rgb_to_lab(rgb) for _, rgb in _candidates])

# Neutral thresholds; photographed black fabric is usually ~RGB 40-70, not pure black.
NEUTRAL_SATURATION = 0.12
BLACK_MAX_VALUE = 0.30
WHITE_MIN_VALUE = 0.85
VERY_DARK_VALUE = 0.15


def nearest_colour_name(rgb: np.ndarray) -> str:
    r, g, b = (float(c) for c in rgb)
    value = max(r, g, b) / 255.0
    saturation = 0.0 if value == 0 else (max(r, g, b) - min(r, g, b)) / max(r, g, b)

    # Low-saturation colours are named by brightness alone.
    if value < VERY_DARK_VALUE:
        return "black"
    if saturation < NEUTRAL_SATURATION:
        if value < BLACK_MAX_VALUE:
            return "black"
        if value > WHITE_MIN_VALUE:
            return "white"
        return "grey"

    # Tinted, so only match chromatic names (e.g. dark wine-red -> maroon, not black).
    lab = rgb_to_lab(rgb)
    family = CHROMATIC_NAMES[int(np.argmin(np.sum((CHROMATIC_LAB - lab) ** 2, axis=1)))]
    if family in SHADEABLE:
        if lab[0] > LIGHT_L:
            return f"light {family}"
        if lab[0] < DARK_L:
            return f"dark {family}"
    return family


MAX_COLOUR_PIXELS = 100_000


def extract_dominant_colour(foreground: Image.Image, k: int = 4) -> str:
    """Return the dominant colour name of the garment, ignoring transparent and edge pixels."""
    rgba = np.array(foreground.convert("RGBA"))
    # Erode the mask so semi-blended cut-out edges don't bias the result.
    mask = cv2.erode((rgba[..., 3] > 128).astype(np.uint8), np.ones((5, 5), np.uint8))
    pixels = rgba[mask.astype(bool), :3]
    if len(pixels) == 0:
        pixels = rgba[rgba[..., 3] > 128, :3]
    if len(pixels) == 0:
        return "unknown"
    if len(pixels) > MAX_COLOUR_PIXELS:
        rng = np.random.default_rng(0)
        pixels = pixels[rng.choice(len(pixels), MAX_COLOUR_PIXELS, replace=False)]
    # Cluster in Lab so clusters follow perceived colour differences.
    lab = cv2.cvtColor(pixels.reshape(-1, 1, 3).astype(np.float32) / 255.0, cv2.COLOR_RGB2LAB)
    lab = lab.reshape(-1, 3)
    k = min(k, len(lab))
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 50, 0.1)
    _, labels, centers = cv2.kmeans(lab, k, None, criteria, 10, cv2.KMEANS_PP_CENTERS)
    dominant = centers[np.argmax(np.bincount(labels.flatten()))]
    rgb = cv2.cvtColor(dominant.reshape(1, 1, 3).astype(np.float32), cv2.COLOR_LAB2RGB)
    return nearest_colour_name(rgb.reshape(3) * 255.0)


def strip_background(image_bytes: bytes) -> tuple[Image.Image, Image.Image]:
    no_bg_bytes = remove(image_bytes)
    foreground = Image.open(io.BytesIO(no_bg_bytes)).convert("RGBA")
    # Flatten onto white for the model; colour extraction uses the alpha channel instead.
    white_bg = Image.new("RGBA", foreground.size, (255, 255, 255, 255))
    flattened = Image.alpha_composite(white_bg, foreground).convert("RGB")
    return flattened, foreground


def encode_png(image: Image.Image) -> str:
    """Encode the background-removed (transparent) image as base64 PNG."""
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")


@app.post("/analyze-item")
async def analyze_item(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image, foreground = strip_background(image_bytes)

    category, category_confidence = zero_shot_classify(image, CATEGORY_LABELS)
    style, style_confidence = zero_shot_classify(image, STYLE_LABELS)
    colour = extract_dominant_colour(foreground)
    embedding = get_embedding(image)

    return {
        "category": category,
        "category_confidence": round(category_confidence, 3),
        "style": style,
        "style_confidence": round(style_confidence, 3),
        "colour": colour,
        "embedding": embedding,
        "image_png_base64": encode_png(foreground),
    }

@app.post("/analyze-colours")
async def analyze_colours(file: UploadFile = File(...)):
    """Return a face-landmark guided, estimated seasonal colour palette."""
    if file.content_type and file.content_type.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Please choose a JPEG, PNG or WebP photo.")

    image_bytes = await file.read(MAX_COLOUR_PHOTO_BYTES + 1)
    if len(image_bytes) > MAX_COLOUR_PHOTO_BYTES:
        raise HTTPException(status_code=413, detail="This photo is too large. Please choose an image under 12 MB.")
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The selected photo is empty.")

    try:
        return analyze_colour_image(image_bytes)
    except AnalysisError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.get("/health")
async def health():
    return {"status": "ok"}
