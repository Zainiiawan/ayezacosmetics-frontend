from PIL import Image, ImageDraw

# Load the transparent logo (which has the ring, AC, and text)
img = Image.open('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_transparent_text.png')
pixels = img.load()
width, height = img.size

# We want to isolate JUST the AC motif and leaves.
# The ring is on the very outer edges (radius ~480-500 from center).
# The text is in the lower half (y > height * 0.63).
# Let's erase the ring (by clearing the outer borders) and the text (by clearing bottom).

cutoff_y = int(height * 0.63)
for y in range(height):
    for x in range(width):
        # Erase everything below cutoff (text)
        if y > cutoff_y:
            pixels[x, y] = (0, 0, 0, 0)
        
        # Erase the outer ring by checking distance from center (width/2, height/2)
        # The ring is at radius ~500 on a 1024x1024 image.
        # Let's just clear everything outside a smaller radius (e.g. 420) to wipe the ring.
        cx = width / 2
        cy = height / 2
        dist = ((x - cx)**2 + (y - cy)**2)**0.5
        if dist > 420:
            pixels[x, y] = (0, 0, 0, 0)

# Now we have ONLY the AC motif!
# Let's find its bounding box so we can center it
min_x, min_y, max_x, max_y = width, height, 0, 0
for y in range(height):
    for x in range(width):
        if pixels[x, y][3] > 0:
            min_x, min_y, max_x, max_y = min(min_x, x), min(min_y, y), max(max_x, x), max(max_y, y)

# Crop exactly to the motif
motif = img.crop((min_x, min_y, max_x, max_y))

# Create a new perfectly square canvas (e.g. 1024x1024)
canvas_size = 1024
canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))

# Resize motif to look nice inside a ring (e.g. 60% of canvas)
target_size = int(canvas_size * 0.60)
ratio = target_size / max(motif.width, motif.height)
new_size = (int(motif.width * ratio), int(motif.height * ratio))
motif_resized = motif.resize(new_size, Image.Resampling.LANCZOS)

# Paste motif in center
cx = (canvas_size - motif_resized.width) // 2
cy = (canvas_size - motif_resized.height) // 2
canvas.paste(motif_resized, (cx, cy), motif_resized)

# Draw a perfect black ring around it
draw = ImageDraw.Draw(canvas)
# Ring parameters
ring_margin = 50
ring_box = (ring_margin, ring_margin, canvas_size - ring_margin, canvas_size - ring_margin)
# Draw outline ring
draw.ellipse(ring_box, outline=(0, 0, 0, 255), width=15)

# Save
canvas.save('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_ac_black_ring.png')
print("Saved perfectly centered AC logo with full black ring.")
