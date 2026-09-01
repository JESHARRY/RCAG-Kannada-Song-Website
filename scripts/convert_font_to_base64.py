import base64
import os

assets_dir = os.path.join(os.getcwd(), "src", "assets")
reg_path = os.path.join(assets_dir, "NotoSansKannada-Regular.ttf")
bold_path = os.path.join(assets_dir, "NotoSansKannada-Bold.ttf")

with open(reg_path, "rb") as f:
    reg_b64 = base64.b64encode(f.read()).decode("utf-8")

with open(bold_path, "rb") as f:
    bold_b64 = base64.b64encode(f.read()).decode("utf-8")

ts_content = f"""// Auto-generated Base64 fonts for PDFMake embedding
export const NOTO_SANS_KANNADA_REGULAR_B64 = "{reg_b64}";
export const NOTO_SANS_KANNADA_BOLD_B64 = "{bold_b64}";
"""

output_path = os.path.join(assets_dir, "kannadaFontBase64.ts")
with open(output_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated {output_path}! Sizes: Regular {len(reg_b64)} chars, Bold {len(bold_b64)} chars.")
