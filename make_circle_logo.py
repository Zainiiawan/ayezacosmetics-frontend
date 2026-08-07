from PIL import Image, ImageDraw

# Load the isolated AC logo
ac_img = Image.open('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_ac_only.png')

# The size of our final circular logo
canvas_size = 1024

# The color for the background (Rose Pink)
# Let's use a beautiful soft rose pink: #E8C4C4 (232, 196, 196)
bg_color = (232, 196, 196, 255)

# Create the solid background canvas
bg = Image.new('RGBA', (canvas_size, canvas_size), bg_color)

# Resize the AC logo to fit beautifully inside the circle (leaving some margin)
# We want the max dimension of the AC logo to be about 65% of the canvas size
target_size = int(canvas_size * 0.65)
ratio = target_size / max(ac_img.width, ac_img.height)
new_size = (int(ac_img.width * ratio), int(ac_img.height * ratio))
ac_resized = ac_img.resize(new_size, Image.Resampling.LANCZOS)

# Calculate centering coordinates
x = (canvas_size - ac_resized.width) // 2
y = (canvas_size - ac_resized.height) // 2

# Paste the AC logo onto the background using its alpha channel
bg.paste(ac_resized, (x, y), ac_resized)

# Now, we apply a circular mask to make it a "proper logo shape"
mask = Image.new('L', (canvas_size, canvas_size), 0)
draw = ImageDraw.Draw(mask)
# Draw a smooth circle
draw.ellipse((0, 0, canvas_size, canvas_size), fill=255)

# Apply the mask to the background
bg.putalpha(mask)

# Save the final image
bg.save('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_ac_rose_circle.png')
print("Saved circular AC logo.")
