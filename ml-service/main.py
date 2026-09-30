"""
ml-service: image analysis for wardrobe uploads

Given a clothing photo, this service:
1. Removes the background (rembg)
2. Classifies the item's category (Marqo-FashionCLIP)
3. Extracts a dominant colour name (OpenCV)
4. Returns an embedding

"""

import io

import cv2
import numpy as np
import open_clip
import torch
from fastapi import FastAPI, File, UploadFile
from PIL import Image
from rembg import remove

app = FastAPI(title="Wardrobe ML Service")

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

# Style is fuzzier than category (a jacket is objectively a jacket, but
# "streetwear" vs "casual" can overlap
STYLE_LABELS = [
    "streetwear", "coquette", "workwear", "casual", "goth", "alternative",
    "formal", "athleisure", "preppy", "minimalist",
]

# Colour names a wardrobe item can be tagged with. Matching is nearest-in-Lab,
# so each entry claims the region of colour space closest to it: add a name
# only if it is a colour users would actually call something, and keep it
# perceptually distinct from its neighbours. Black/white/grey are also caught
# earlier by the neutral check in nearest_colour_name.
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
    """Score an image against an arbitrary label list and return the
    best match plus its confidence. Category and style both call this
    with a different `labels` list, same underlying mechanism.

    Confidence comes from the model itself: it embeds the image and
    every label into the same vector space, scores each label by how
    close it is to the image (cosine similarity, scaled by 100), then
    runs softmax across those scores. The number returned is the
    probability mass assigned to the winning label *relative to the
    other labels in this call* — it is not an absolute certainty, and
    it will change if you add, remove, or reword labels.
    """
    image_input = preprocess(image).unsqueeze(0)
    text_inputs = tokenizer(labels)
    with torch.no_grad():
        image_features = model.encode_image(image_input, normalize=True)
        text_features = model.encode_text(text_inputs, normalize=True)
        probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)
    best_idx = int(probs.argmax())
    return labels[best_idx], float(probs[0, best_idx])


def get_embedding(image: Image.Image) -> list[float]:
    """Same model, reused for outfit matching and recommendations later,
    so category tagging and embeddings come from one forward pass."""
    image_input = preprocess(image).unsqueeze(0)
    with torch.no_grad():
        features = model.encode_image(image_input, normalize=True)
    return features[0].tolist()


def rgb_to_lab(rgb) -> np.ndarray:
    """Convert one 0-255 RGB triple to CIE Lab, where Euclidean distance
    roughly matches perceived colour difference (unlike raw RGB)."""
    pixel = np.array(rgb, dtype=np.float32).reshape(1, 1, 3) / 255.0
    return cv2.cvtColor(pixel, cv2.COLOR_RGB2LAB).reshape(3)


NEUTRAL_NAMES = {"black", "white", "grey"}
NAMED_COLOURS_LAB = {name: rgb_to_lab(rgb) for name, rgb in NAMED_COLOURS.items()}

# Below these saturation/brightness levels a colour is treated as a neutral
# (black/grey/white) by brightness alone. Photographed black fabric is rarely
# pure (0,0,0); it typically lands around RGB 40-70 with a slight tint.
NEUTRAL_SATURATION = 0.12
BLACK_MAX_VALUE = 0.30
WHITE_MIN_VALUE = 0.85
VERY_DARK_VALUE = 0.15


def nearest_colour_name(rgb: np.ndarray) -> str:
    r, g, b = (float(c) for c in rgb)
    value = max(r, g, b) / 255.0
    saturation = 0.0 if value == 0 else (max(r, g, b) - min(r, g, b)) / max(r, g, b)

    # Neutral check first: low-saturation colours are decided by brightness,
    # so a dark charcoal pixel can't be pulled toward a tinted palette entry.
    if value < VERY_DARK_VALUE:
        return "black"
    if saturation < NEUTRAL_SATURATION:
        if value < BLACK_MAX_VALUE:
            return "black"
        if value > WHITE_MIN_VALUE:
            return "white"
        return "grey"

    # Clearly tinted at this point, so only chromatic names are candidates:
    # a very dark wine-red should become maroon, not black.
    lab = rgb_to_lab(rgb)
    return min(
        (name for name in NAMED_COLOURS_LAB if name not in NEUTRAL_NAMES),
        key=lambda name: float(np.sum((lab - NAMED_COLOURS_LAB[name]) ** 2)),
    )

def extract_dominant_colour(foreground: Image.Image, k: int = 3) -> str:
    """Cluster only the actual garment pixels (alpha > 128), not the
    white padding strip_background flattens transparency onto — otherwise
    a garment that doesn't fill the frame gets outvoted by the padding."""
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
    # Flatten onto white so category/embedding steps, which expect RGB,
    # don't get thrown off by transparent pixels. Colour extraction uses
    # `foreground`'s alpha channel instead, so it isn't skewed by the padding.
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


@app.get("/health")
async def health():
    return {"status": "ok"}