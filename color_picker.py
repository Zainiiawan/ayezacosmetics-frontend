from PIL import Image
from collections import Counter
import sys

img = Image.open("/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/current_logo.png").convert("RGBA")
pixels = list(img.getdata())
c = Counter(pixels)
print("Top 10 colors:")
for color, count in c.most_common(10):
    print(f"Color {color}: {count} pixels")
