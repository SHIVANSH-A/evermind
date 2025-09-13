import face_recognition
import numpy as np

# Load the image file (replace with your downloaded image)
image = face_recognition.load_image_file("./nancy.jpg")

# Detect face encodings (128-d vector per face)
encodings = face_recognition.face_encodings(image)

if len(encodings) == 0:
    print("❌ No face detected in the image.")
else:
    embedding = encodings[0]  # Take the first face found
    print("✅ Face embedding (128-d):")
    print(np.array2string(embedding, separator=","))
