import urllib.request
import os

url_bold = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansKannada/NotoSansKannada-Bold.ttf"
dest_dir = os.path.join(os.getcwd(), "src", "assets")
dest_bold = os.path.join(dest_dir, "NotoSansKannada-Bold.ttf")

try:
    urllib.request.urlretrieve(url_bold, dest_bold)
    print(f"Bold font downloaded! Size: {os.path.getsize(dest_bold)} bytes")
except Exception as e:
    print(f"Error: {e}")
