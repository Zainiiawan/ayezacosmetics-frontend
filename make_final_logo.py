from PIL import Image, ImageDraw

# Load the transparent AC motif
img = Image.open('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_transparent_text.png')
pixels = img.load()
width, height = img.size

# Erase everything outside a small radius to get just the AC motif
cx = width / 2
cy = height / 2
cutoff_y = int(height * 0.63)
for y in range(height):
    for x in range(width):
        dist = ((x - cx)**2 + (y - cy)**2)**0.5
        if y > cutoff_y or dist > 420:
            pixels[x, y] = (0, 0, 0, 0)

# Bounding box crop for AC motif
min_x, min_y, max_x, max_y = width, height, 0, 0
for y in range(height):
    for x in range(width):
        if pixels[x, y][3] > 0:
            min_x, min_y, max_x, max_y = min(min_x, x), min(min_y, y), max(max_x, x), max(max_y, y)
motif = img.crop((min_x, min_y, max_x, max_y))

# Canvas sizes
canvas_size = 1024
canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))

draw = ImageDraw.Draw(canvas)

# Circle parameters
ring_margin = 20
circle_box = (ring_margin, ring_margin, canvas_size - ring_margin, canvas_size - ring_margin)

# Draw the solid Rose Pink inner circle
# Rose Pink Hex: #e8c4c4
draw.ellipse(circle_box, fill=(232, 196, 196, 255))

# Draw the complete Black border ring on the outside
draw.ellipse(circle_box, outline=(0, 0, 0, 255), width=25)

# Resize motif to fit perfectly inside the circle
target_size = int(canvas_size * 0.65)
ratio = target_size / max(motif.width, motif.height)
new_size = (int(motif.width * ratio), int(motif.height * ratio))
motif_resized = motif.resize(new_size, Image.Resampling.LANCZOS)

# Paste motif in center
cx = (canvas_size - motif_resized.width) // 2
cy = (canvas_size - motif_resized.height) // 2
canvas.paste(motif_resized, (cx, cy), motif_resized)

# Save the final image
canvas.save('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_final_rose_black_ring.png')
print("Saved final logo.")
