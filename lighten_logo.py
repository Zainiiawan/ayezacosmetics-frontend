import cv2
import numpy as np

# Load the generated image
img = cv2.imread('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_rosegold_black_1786137869957.jpg')

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# The background is the most common color. Let's find its grayscale value.
# We can just take a pixel near the edge, or the 95th percentile.
bg_gray_val = np.percentile(gray, 95)

# Normalize the grayscale image so background = 1.0 and black text = 0.0
# Anything above bg_gray_val becomes 1.0
alpha = np.clip(gray / bg_gray_val, 0, 1.0)

# Define the new LIGHT rose gold / peach color (BGR format for OpenCV)
# Light Rose Gold / Peach hex: #F5E6E6 or #F9EBEA or #FADBD8
# Let's use a very soft light peach-rose: #f4dada (RGB: 244, 218, 218) -> BGR: (218, 218, 244)
new_bg_color = np.array([218, 218, 244], dtype=np.float32)

# Create the new image
# new_pixel = new_bg_color * alpha (since text is black, when alpha is 0, pixel is black)
new_img = np.zeros_like(img, dtype=np.float32)
for i in range(3):
    new_img[:, :, i] = new_bg_color[i] * alpha

# Convert back to uint8
new_img = np.clip(new_img, 0, 255).astype(np.uint8)

# Save the new lightened image
cv2.imwrite('/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_light_rosegold.jpg', new_img)
print("Saved perfectly colored light rose gold logo.")
