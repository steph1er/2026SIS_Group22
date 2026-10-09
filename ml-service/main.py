"""
ml-service: image analysis for wardrobe uploads

Given a clothing photo, this service:
1. Removes the background (rembg)
2. Classifies the item's category (Marqo-FashionCLIP)
3. Extracts a dominant colour name (OpenCV)
4. Returns an embedding

"""

import io
import os

import cv2
import numpy as np
import open_clip
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
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

# Matched by nearest Lab distance, so keep entries perceptually distinct.
NAMED_COLOURS = {
    # neutrals
    "black": (0, 0, 0), "white": (255, 255, 255), "grey": (128, 128, 128),
    "cream": (255, 253, 208), "beige": (222, 202, 176), "tan": (210, 180, 140),
    "khaki": (189, 183, 107), "brown": (139, 69, 19), "chocolate": (92, 51, 23),
    # reds / pinks
    "red": (237, 28, 36), "burgundy": (128, 0, 32), "maroon": (100, 20, 30),
    "rust": (183, 65, 14), "coral": (255, 127, 80), "salmon": (250, 160, 140),
    "peach": (255, 218, 185), "pink": (255, 192, 203), "hot pink": (255, 20, 147),
    "magenta": (200, 30, 140),
    # oranges / yellows
    "orange": (255, 127, 39), "mustard": (204, 160, 30), "yellow": (255, 242, 0),
    # greens
    "green": (34, 139, 34), "dark green": (0, 80, 40), "olive": (107, 112, 35),
    "sage": (156, 175, 136), "mint": (170, 230, 200), "lime": (150, 220, 40),
    # blues / teals
    "teal": (0, 128, 128), "turquoise": (64, 224, 208), "light blue": (173, 216, 230),
    "denim blue": (80, 110, 150), "blue": (0, 90, 190), "royal blue": (30, 60, 200),
    "navy": (0, 0, 128),
    # purples
    "lavender": (200, 180, 230), "purple": (128, 0, 128),
    "plum": (110, 40, 90),
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


NEUTRAL_NAMES = {"black", "white", "grey"}
NAMED_COLOURS_LAB = {name: rgb_to_lab(rgb) for name, rgb in NAMED_COLOURS.items()}

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
    return min(
        (name for name in NAMED_COLOURS_LAB if name not in NEUTRAL_NAMES),
        key=lambda name: float(np.sum((lab - NAMED_COLOURS_LAB[name]) ** 2)),
    )

def extract_dominant_colour(foreground: Image.Image, k: int = 3) -> str:
    """Return the dominant colour name of the garment, ignoring transparent pixels."""
    rgba = np.array(foreground.convert("RGBA")).reshape(-1, 4)
    opaque_pixels = rgba[rgba[:, 3] > 128, :3].astype(np.float32)
    if len(opaque_pixels) == 0:
        return "unknown"
    k = min(k, len(opaque_pixels))
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.5)
    _, labels, centers = cv2.kmeans(
        opaque_pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS
    )
    counts = np.bincount(labels.flatten())
    dominant = centers[np.argmax(counts)]
    return nearest_colour_name(dominant)


def strip_background(image_bytes: bytes) -> tuple[Image.Image, Image.Image]:
    no_bg_bytes = remove(image_bytes)
    foreground = Image.open(io.BytesIO(no_bg_bytes)).convert("RGBA")
    # Flatten onto white for the model; colour extraction uses the alpha channel instead.
    white_bg = Image.new("RGBA", foreground.size, (255, 255, 255, 255))
    flattened = Image.alpha_composite(white_bg, foreground).convert("RGB")
    return flattened, foreground


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
