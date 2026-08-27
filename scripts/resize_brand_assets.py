from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "images" / "icon.png"

with Image.open(SOURCE) as image:
    rgb = image.convert("RGB")

    def save_icon(path: Path, size: int) -> None:
        resized = rgb.resize((size, size), Image.Resampling.LANCZOS)
        # O ícone é vetorial/chapado; paleta adaptativa preserva a aparência e reduz bastante o PNG.
        optimized = resized.quantize(colors=128, method=Image.Quantize.MEDIANCUT)
        optimized.save(path, optimize=True)

    save_icon(ROOT / "assets" / "images" / "icon.png", 1024)
    save_icon(ROOT / "assets" / "images" / "android-icon-foreground.png", 1024)
    save_icon(ROOT / "assets" / "images" / "splash-icon.png", 512)
    save_icon(ROOT / "assets" / "images" / "favicon.png", 196)
    save_icon(ROOT / "public" / "logo512.png", 512)
    save_icon(ROOT / "public" / "logo192.png", 192)
