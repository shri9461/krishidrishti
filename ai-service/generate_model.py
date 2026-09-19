import os

def generate_lightweight_model():
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models
        import numpy as np

        print("TensorFlow loaded. Creating a lightweight plant disease classification model...")
        model = models.Sequential([
            layers.Input(shape=(224, 224, 3)),
            layers.Conv2D(16, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Flatten(),
            layers.Dense(32, activation='relu'),
            layers.Dense(4, activation='softmax') # Tomato Late Blight, Potato Early Blight, Corn Common Rust, Healthy
        ])

        model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        
        # Save the model
        model.save('plant_disease_model.h5')
        print("Success! Created and saved model as 'plant_disease_model.h5'")
    except ImportError:
        print("TensorFlow is not installed in the current Python environment. Skipping model creation.")
    except Exception as e:
        print(f"An error occurred while generating model: {e}")

if __name__ == '__main__':
    generate_lightweight_model()
