"""Twelve-season palette definitions and deterministic classification rules."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Palette:
    colours: tuple[tuple[str, str], ...]
    avoid: tuple[tuple[str, str], ...]
    suggestion: str


PALETTES: dict[str, Palette] = {
    "Light Spring": Palette(
        (("Peach", "#F6B38D"), ("Warm ivory", "#FFF3D6"), ("Coral", "#F47C6C"), ("Aqua", "#65C9C2"), ("Fresh green", "#85B85B"), ("Camel", "#C69A65"), ("Butter yellow", "#F5D76E"), ("Warm pink", "#EA8F9C")),
        (("Black", "#171717"), ("Burgundy", "#651E32"), ("Icy blue", "#B7D7F0"), ("Charcoal", "#41444A")),
        "Light, warm and clear shades echo your lighter colouring while keeping your complexion bright. Choose warm ivory or camel instead of stark black near the face.",
    ),
    "Warm Spring": Palette(
        (("Tomato red", "#E94B35"), ("Golden yellow", "#F2BE3E"), ("Leaf green", "#69A84F"), ("Turquoise", "#20AFA8"), ("Warm beige", "#D9B382"), ("Coral", "#F07F68"), ("Salmon", "#F39B86"), ("Cognac", "#A9643A")),
        (("Cool grey", "#7D8793"), ("Fuchsia", "#C32478"), ("Icy lavender", "#DCD2F3"), ("Pure black", "#101010")),
        "Warm, sunlit colours reinforce your golden quality. Clear greens, corals and warm neutrals are especially flattering near the face.",
    ),
    "Bright Spring": Palette(
        (("Poppy", "#EE3F35"), ("Bright coral", "#FF6D61"), ("Lime", "#A4C639"), ("Aqua", "#00B7B5"), ("Cobalt", "#2367C9"), ("Marigold", "#F5A623"), ("Cream", "#FFF1CE"), ("Hot pink", "#E83E8C")),
        (("Dusty rose", "#B98F98"), ("Mushroom", "#9C8F84"), ("Muted mauve", "#8E7085"), ("Slate", "#66727D")),
        "Clear, energetic colour matches your brightness and contrast. Pair vivid warm shades with cream, cognac or clear navy.",
    ),
    "Light Summer": Palette(
        (("Powder blue", "#AFCBE3"), ("Rose pink", "#DFA6B6"), ("Soft navy", "#526A8A"), ("Lavender", "#B7A6D2"), ("Seafoam", "#A8D5C2"), ("Cool taupe", "#B6A9A2"), ("Raspberry", "#B94E72"), ("Soft white", "#F6F3F1")),
        (("Orange", "#E87524"), ("Mustard", "#B68A1E"), ("Dark brown", "#4A2C20"), ("Black", "#131313")),
        "Light, cool and softly blended shades support your delicate colouring. Use soft navy and cool taupe as gentler neutrals.",
    ),
    "Cool Summer": Palette(
        (("Blue rose", "#C95C86"), ("Periwinkle", "#778BCB"), ("Plum", "#77506E"), ("Cool teal", "#388B8C"), ("Soft navy", "#3F5577"), ("Blue grey", "#8C9CAC"), ("Berry", "#9D3F67"), ("Cool white", "#F4F4F3")),
        (("Pumpkin", "#C96623"), ("Camel", "#B68A58"), ("Tomato", "#D64A32"), ("Warm olive", "#7A7630")),
        "Blue based, moderately soft colours harmonise with your cool quality. Try berry, teal and soft navy close to your face.",
    ),
    "Soft Summer": Palette(
        (("Dusty rose", "#B98491"), ("Mauve", "#8D6F86"), ("Sage", "#8FA796"), ("Slate blue", "#70889D"), ("Soft plum", "#765A70"), ("Mushroom", "#9B9088"), ("Denim", "#627D99"), ("Oyster", "#E7DFD8")),
        (("Neon lime", "#B8F000"), ("Bright orange", "#FF6A20"), ("Jet black", "#080808"), ("Golden yellow", "#F2B600")),
        "Muted, cool colours repeat your low to medium contrast. Layer neighbouring dusty shades for an easy, balanced look.",
    ),
    "Soft Autumn": Palette(
        (("Sage", "#96A47B"), ("Dusty coral", "#C98673"), ("Moss", "#73794A"), ("Warm taupe", "#9E8978"), ("Muted teal", "#4F8780"), ("Clay", "#B66E51"), ("Oatmeal", "#D8C8A9"), ("Soft olive", "#8B8A55")),
        (("Icy pink", "#F2CDE0"), ("Royal blue", "#2747C7"), ("Jet black", "#080808"), ("Neon magenta", "#F00086")),
        "Warm, muted earth shades complement your gentle colouring. Tonal outfits in sage, taupe, clay and soft teal work especially well.",
    ),
    "Warm Autumn": Palette(
        (("Olive", "#6F762E"), ("Camel", "#C08A52"), ("Rust", "#B6532F"), ("Terracotta", "#C86B4A"), ("Mustard", "#C7982E"), ("Warm brown", "#70402C"), ("Forest green", "#2F6045"), ("Cream", "#F4E6C2")),
        (("Icy blue", "#BEDAF2"), ("Cool pink", "#E09CC4"), ("Silver grey", "#AEB6C1"), ("Electric blue", "#2754D7")),
        "Rich golden earth tones reinforce your warmth and depth. Olive, rust, camel and cream make an especially cohesive combination.",
    ),
    "Deep Autumn": Palette(
        (("Espresso", "#4A2B25"), ("Deep olive", "#4E5A2A"), ("Aubergine", "#57364F"), ("Rust", "#A94F2D"), ("Petrol teal", "#245F5D"), ("Mustard", "#B98A27"), ("Warm navy", "#283E4A"), ("Ivory", "#EFE0BF")),
        (("Baby pink", "#F1C5D6"), ("Icy mint", "#C9EFE2"), ("Pale lilac", "#D9CDED"), ("Optic white", "#FFFFFF")),
        "Deep, warm and slightly muted colours match your richness. Anchor outfits with espresso, deep olive or warm navy rather than pale pastels.",
    ),
    "Deep Winter": Palette(
        (("Black", "#111111"), ("Burgundy", "#681E39"), ("Pine", "#154E45"), ("Deep navy", "#182E5B"), ("Aubergine", "#4A2347"), ("Ruby", "#A7193F"), ("Emerald", "#087B64"), ("Icy white", "#F7FAFF")),
        (("Camel", "#C49A68"), ("Peach", "#F3B093"), ("Mustard", "#BE9229"), ("Warm beige", "#D6B38A")),
        "Deep jewel tones and crisp dark neutrals match your cool depth. High contrast combinations such as pine with icy white can be striking.",
    ),
    "Cool Winter": Palette(
        (("Cobalt", "#2056B8"), ("True red", "#C81D3C"), ("Emerald", "#00856D"), ("Royal purple", "#673A9E"), ("Fuchsia", "#C52778"), ("Charcoal", "#343944"), ("Black", "#0D0D0F"), ("Pure white", "#FFFFFF")),
        (("Orange", "#D96E27"), ("Camel", "#BB8B55"), ("Warm olive", "#79752E"), ("Cream", "#F1DFB7")),
        "Clear blue based colours mirror your cool, high contrast colouring. Cobalt, emerald and true red are strong choices near the face.",
    ),
    "Bright Winter": Palette(
        (("Electric blue", "#135DD8"), ("Hot pink", "#E42487"), ("Clear red", "#E21F3D"), ("Emerald", "#009873"), ("Violet", "#7139B6"), ("Icy aqua", "#A9EEF1"), ("Black", "#090909"), ("White", "#FFFFFF")),
        (("Dusty beige", "#B5A18F"), ("Muted olive", "#77784F"), ("Rust", "#A65335"), ("Muddy mauve", "#846C78")),
        "Bright, cool shades stand up to your clarity and contrast. Crisp colour blocking and black with white will usually feel more harmonious than muted blends.",
    ),
}


def classify_season(undertone: str, depth: str, chroma: str, contrast: str) -> str:
    """Map measured colour characteristics onto a practical 12-season recommendation."""
    warm = undertone == "Warm"
    cool = undertone == "Cool"

    if depth == "Light":
        if warm:
            return "Light Spring"
        if cool:
            return "Light Summer"
        return "Light Spring" if chroma == "Bright" else "Light Summer"

    if depth == "Deep":
        if warm:
            return "Deep Autumn"
        if cool:
            return "Deep Winter"
        return "Deep Winter" if contrast == "High" else "Deep Autumn"

    if chroma == "Bright":
        if warm:
            return "Bright Spring"
        if cool:
            return "Bright Winter"
        return "Bright Winter" if contrast == "High" else "Bright Spring"

    if contrast == "High":
        if warm:
            return "Bright Spring"
        return "Cool Winter"

    if chroma == "Soft" or contrast == "Low":
        if warm:
            return "Soft Autumn"
        if cool:
            return "Soft Summer"
        return "Soft Autumn" if depth == "Medium-deep" else "Soft Summer"

    if warm:
        return "Warm Autumn" if depth == "Medium-deep" else "Warm Spring"
    if cool:
        return "Cool Winter" if contrast == "High" else "Cool Summer"
    return "Warm Autumn" if depth == "Medium-deep" else "Cool Summer"
