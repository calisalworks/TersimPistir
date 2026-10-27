#!/usr/bin/env python3
"""Generate Android launcher icon resources from the app's branded source image."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

SOURCE = Path("public/assets/aistudio/tersim_pistir_transparent_logo.png")
RES = Path("android/app/src/main/res")
if not SOURCE.is_file():
    raise SystemExit(f"Launcher icon source not found: {SOURCE}")

logo = Image.open(SOURCE).convert("RGBA")
# Legacy launcher icons are square and use the complete logo on a dark neutral
# background, while adaptive icons keep transparency in the foreground layer.
background = (17, 24, 39, 255)
sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}
for density, size in sizes.items():
    canvas = Image.new("RGBA", (size, size), background)
    fitted = ImageOps.contain(logo, (int(size * 0.78), int(size * 0.78)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2))
    folder = RES / f"mipmap-{density}"
    folder.mkdir(parents=True, exist_ok=True)
    canvas.save(folder / "ic_launcher.png", optimize=True)

# Android adaptive icon foreground is 108dp; keep the mark within the
# central safe area so launchers can apply circular/squircle masks safely.
adaptive_size = 432
foreground = Image.new("RGBA", (adaptive_size, adaptive_size), (0, 0, 0, 0))
fitted = ImageOps.contain(logo, (int(adaptive_size * 0.60), int(adaptive_size * 0.60)), Image.Resampling.LANCZOS)
foreground.alpha_composite(fitted, ((adaptive_size - fitted.width) // 2, (adaptive_size - fitted.height) // 2))
folder = RES / "mipmap-xxxhdpi"
foreground.save(folder / "ic_launcher_foreground.png", optimize=True)

values = RES / "values"
values.mkdir(parents=True, exist_ok=True)
(values / "ic_launcher_background.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n'
    '<resources>\n    <color name="ic_launcher_background">#111827</color>\n</resources>\n',
    encoding="utf-8",
)
adaptive = RES / "mipmap-anydpi-v26"
adaptive.mkdir(parents=True, exist_ok=True)
(adaptive / "ic_launcher.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n'
    '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
    '    <background android:drawable="@color/ic_launcher_background" />\n'
    '    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n'
    '</adaptive-icon>\n',
    encoding="utf-8",
)
print("Generated branded legacy and adaptive Android launcher icons.")
