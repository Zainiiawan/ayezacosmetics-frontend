from PIL import Image

# Load the generated image
img = Image.open('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_rosegold_black_1786137869957.jpg').convert('L') # Convert to grayscale

# The image is dark text on a rose-gold background.
# Grayscale of rose-gold is light gray. Text is near black.
# We want to create an image where the color is solid black, 
# and the alpha channel (transparency) is the inverse of the grayscale value!
# So black text (0) becomes alpha 255 (fully opaque)
# Rose-gold background (~120-150) becomes alpha 0 (fully transparent)

# Let's find the background grayscale value (mode of the image)
hist = img.histogram()
bg_val = hist.index(max(hist))

# Create a new image with a transparent background
out = Image.new("RGBA", img.size, (0, 0, 0, 0))
pixels = out.load()
gray_pixels = img.load()

for y in range(img.height):
    for x in range(img.width):
        val = gray_pixels[x, y]
        # Normalize so bg_val is 0 alpha, and 0 is 255 alpha
        # Alpha = 255 * (1 - (val / bg_val))
        alpha = int(255 * (1 - min(val / bg_val, 1.0)))
        
        # To make it look smoother and remove faint background shadows:
        if alpha < 20:
            alpha = 0
            
        pixels[x, y] = (0, 0, 0, alpha)

# Save the extracted logo
out.save('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_transparent_text.png')
print("Saved transparent logo.")
