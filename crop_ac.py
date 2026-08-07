from PIL import Image

# Load the transparent logo
img = Image.open('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_transparent_text.png')
pixels = img.load()
width, height = img.size

# The layout: AC monogram is in the top/middle. 
# "AYEZA" text is below it.
# Let's find the approximate Y-coordinate where "AYEZA" starts.
# We can look for the large gap between the bottom of the 'C' and the top of 'A' in 'AYEZA'.
# Or we can just manually set a cutoff. The moon shape of C ends around y = height * 0.60
cutoff_y = int(height * 0.63)

# Erase everything below the cutoff (set alpha to 0)
for y in range(cutoff_y, height):
    for x in range(width):
        pixels[x, y] = (0, 0, 0, 0)

# Now, let's find the bounding box of the remaining non-transparent pixels
min_x = width
min_y = height
max_x = 0
max_y = 0

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if a > 0:
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

# Crop to the bounding box with a little padding
padding = 40
min_x = max(0, min_x - padding)
min_y = max(0, min_y - padding)
max_x = min(width, max_x + padding)
max_y = min(height, max_y + padding)

ac_only = img.crop((min_x, min_y, max_x, max_y))

# Save the extracted AC logo
ac_only.save('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_ac_only.png')
print("Saved AC only logo.")
