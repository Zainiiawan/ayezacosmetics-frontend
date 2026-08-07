from PIL import Image
import colorsys

img = Image.open('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/current_logo.png').convert("RGBA")
pixels = img.load()

# Rose gold target (Hue ~ 340-350 degrees -> 345/360 = 0.958)
target_h = 0.958

for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue
            
        # Convert to HSV (values are 0-1)
        h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
        
        # Check if white-ish text
        if s < 0.15 and v > 0.8:
            # Darken it
            v = max(0.0, v - 0.7)
            # Convert back
            new_r, new_g, new_b = colorsys.hsv_to_rgb(h, s, v)
            pixels[x, y] = (int(new_r*255), int(new_g*255), int(new_b*255), a)
            
        # Check if peach-ish background
        elif 0.05 < h < 0.15 and s > 0.1:
            # Change hue to rose-gold
            h = target_h
            s = min(1.0, s * 0.8) # Slight desaturation
            # Convert back
            new_r, new_g, new_b = colorsys.hsv_to_rgb(h, s, v)
            pixels[x, y] = (int(new_r*255), int(new_g*255), int(new_b*255), a)

img.save('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/edited_logo.png')
print("Saved edited_logo.png")
