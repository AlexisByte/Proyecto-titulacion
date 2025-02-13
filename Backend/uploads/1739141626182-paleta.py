import matplotlib.pyplot as plt
import numpy as np

# Paleta de colores en formato RGB
palette1_rgb = [
    (0, 0, 0),         # Negro
    (0, 0, 128),       # Azul Marino
    (0, 128, 0),       # Verde
    (0, 255, 255),     # Aqua
    (255, 0, 0),       # Rojo
    (128, 0, 128),     # Púrpura
    (128, 64, 0),      # Marrón
    (211, 211, 211),   # Gris Claro
    (169, 169, 169),   # Gris Oscuro
    (0, 0, 255),       # Azul
    (0, 255, 0),       # Lima
    (192, 192, 192),   # Plata
    (0, 128, 128),     # Verde Azulado
    (255, 0, 255),     # Fucsia
    (255, 255, 0),     # Amarillo
    (255, 255, 255)    # Blanco
]

# Tamaño del "canvas"
width, height = 700, 600

# Crear una matriz para los píxeles
image = np.zeros((height, width, 3), dtype=np.uint8)

# Generar el patrón basado en la distancia
for i in range(width):
    for j in range(height):
        color_index = int(np.abs(np.sin(i * 0.1) * np.cos(j * 0.1) * 15 + np.cos(i * 0.1) * np.sin(j * 0.1) * 5) % len(palette1_rgb))
        image[j, i] = palette1_rgb[color_index]  # Asignar color

# Mostrar la imagen generada
plt.imshow(image)
plt.axis('off')  # Opcional: quitar los ejes
plt.show()