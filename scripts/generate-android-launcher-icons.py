#!/usr/bin/env python3
"""Generate branded Android launcher icon resources from the app logo."""
from pathlib import Path
from PIL import Image, ImageOps

SOURCE = Path("public/assets/aistudio/tersim-pistir-round-icon.png")
RES = Path("android/app/src/main/res")
if not SOURCE.is_file():
    raise SystemExit(f"Launcher icon source not found: {SOURCE}")

logo = Image.open(SOURCE).convert("RGBA")
background = (255, 255, 255, 255)
sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

# Provide both icon names: Capacitor/Android manifests can reference either
# ic_launcher or ic_launcher_round depending on Android version and launcher.
for density, size in sizes.items():
    canvas = Image.new("RGBA", (size, size), background)
    fitted = ImageOps.contain(
        logo, (int(size * 0.78), int(size * 0.78)), Image.Resampling.LANCZOS
    )
    canvas.alpha_composite(
        fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2)
    )
    folder = RES / f"mipmap-{density}"
    folder.mkdir(parents=True, exist_ok=True)
    canvas.save(folder / "ic_launcher.png", optimize=True)

    # Round legacy icon: make the artwork smaller and place it on a circular
    # background so the logo's square frame does not collide with the launcher mask.
    round_canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    circle = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    from PIL import ImageDraw
    ImageDraw.Draw(circle).ellipse((0, 0, size - 1, size - 1), fill=background)
    round_canvas.alpha_composite(circle)
    round_fitted = ImageOps.contain(
        logo, (int(size * 0.62), int(size * 0.62)), Image.Resampling.LANCZOS
    )
    round_canvas.alpha_composite(
        round_fitted,
        ((size - round_fitted.width) // 2, (size - round_fitted.height) // 2),
    )
    round_canvas.save(folder / "ic_launcher_round.png", optimize=True)

# Generate adaptive foregrounds at every density. Capacitor creates default
# foregrounds in all mipmap folders; overwriting only xxxhdpi leaves Android
# free to select a default blue/white icon on devices using another density.
for density, icon_size in sizes.items():
    adaptive_size = icon_size * 9 // 4  # 108dp canvas at this density
    foreground = Image.new("RGBA", (adaptive_size, adaptive_size), (0, 0, 0, 0))
    fitted = ImageOps.contain(
        logo,
        (int(adaptive_size * 0.60), int(adaptive_size * 0.60)),
        Image.Resampling.LANCZOS,
    )
    foreground.alpha_composite(
        fitted,
        ((adaptive_size - fitted.width) // 2, (adaptive_size - fitted.height) // 2),
    )
    folder = RES / f"mipmap-{density}"
    folder.mkdir(parents=True, exist_ok=True)
    foreground.save(folder / "ic_launcher_foreground.png", optimize=True)

    # Round adaptive icon gets a smaller foreground to leave a clear circular margin.
    round_foreground = Image.new("RGBA", (adaptive_size, adaptive_size), (0, 0, 0, 0))
    round_fitted = ImageOps.contain(
        logo,
        (int(adaptive_size * 0.44), int(adaptive_size * 0.44)),
        Image.Resampling.LANCZOS,
    )
    round_foreground.alpha_composite(
        round_fitted,
        ((adaptive_size - round_fitted.width) // 2, (adaptive_size - round_fitted.height) // 2),
    )
    round_foreground.save(folder / "ic_launcher_round_foreground.png", optimize=True)

values = RES / "values"
values.mkdir(parents=True, exist_ok=True)
(values / "ic_launcher_background.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n'
    '<resources>\n    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>\n',
    encoding="utf-8",
)

adaptive = RES / "mipmap-anydpi-v26"
adaptive.mkdir(parents=True, exist_ok=True)
for icon_name, foreground_name in (
    ("ic_launcher", "ic_launcher_foreground"),
    ("ic_launcher_round", "ic_launcher_round_foreground"),
):
    (adaptive / f"{icon_name}.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '    <background android:drawable="@color/ic_launcher_background" />\n'
        f'    <foreground android:drawable="@mipmap/{foreground_name}" />\n'
        '</adaptive-icon>\n',
        encoding="utf-8",
    )

# Explicitly wire the generated resources into the manifest. Some generated
# Capacitor projects may retain a different icon reference.
manifest = Path("android/app/src/main/AndroidManifest.xml")
if not manifest.is_file():
    raise SystemExit(f"Android manifest not found: {manifest}")
manifest_text = manifest.read_text(encoding="utf-8")
import re
application_match = re.search(r"<application\b[^>]*>", manifest_text, flags=re.DOTALL)
if not application_match:
    raise SystemExit("Could not find <application> in AndroidManifest.xml")
application_tag = application_match.group(0)
for attribute, value in (
    ("android:icon", "@mipmap/ic_launcher"),
    ("android:roundIcon", "@mipmap/ic_launcher_round"),
):
    if re.search(rf'\b{re.escape(attribute)}\s*=', application_tag):
        application_tag = re.sub(
            rf'\b{re.escape(attribute)}\s*=\s*["\'][^"\']*["\']',
            f'{attribute}="{value}"',
            application_tag,
        )
    else:
        application_tag = application_tag[:-1] + f' {attribute}="{value}">'
manifest_text = (
    manifest_text[:application_match.start()]
    + application_tag
    + manifest_text[application_match.end():]
)
manifest.write_text(manifest_text, encoding="utf-8")

print("Generated branded launcher icons and explicitly wired manifest icon references.")
