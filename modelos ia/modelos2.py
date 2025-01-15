import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import to_categorical
from sklearn.metrics import classification_report

# Cargar los datos desde un archivo CSV
def cargar_datos(ruta_archivo):
    data = pd.read_csv(ruta_archivo)
    return data

# Preprocesamiento de datos
def preprocesar_datos(data, columna_objetivo):
    # Separar características (X) y etiquetas (y)
    X = data.drop(columns=[columna_objetivo])
    y = data[columna_objetivo]

    # Codificar las etiquetas si no son numéricas
    if y.dtype == 'object':
        encoder = LabelEncoder()
        y = encoder.fit_transform(y)

    # Estandarizar los datos
    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    return X, y, scaler

# Construcción de la red neuronal
def construir_modelo(input_dim):
    model = Sequential([
        Dense(64, input_dim=input_dim, activation='relu'),
        Dense(32, activation='relu'),
        Dense(1, activation='sigmoid')  # Para clasificación binaria
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

# Entrenamiento y evaluación
def entrenar_modelo(model, X_train, y_train, X_val, y_val, epochs=50, batch_size=32):
    history = model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=epochs, batch_size=batch_size)
    return history

# Predicciones
def realizar_predicciones(model, X_test, threshold=0.5):
    probas = model.predict(X_test)
    return (probas >= threshold).astype(int)

# Main
if __name__ == "__main__":
    ruta_archivo = "ruta_a_tu_archivo.csv"  # Cambia esto por la ruta de tu archivo CSV
    columna_objetivo = "columna_objetivo"  # Cambia esto por el nombre de la columna objetivo en tu archivo CSV

    # Cargar y preprocesar los datos
    datos = cargar_datos(ruta_archivo)
    X, y, scaler = preprocesar_datos(datos, columna_objetivo)

    # Dividir los datos en entrenamiento, validación y prueba
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    # Construir y entrenar el modelo
    modelo = construir_modelo(input_dim=X_train.shape[1])
    historia = entrenar_modelo(modelo, X_train, y_train, X_val, y_val, epochs=50, batch_size=32)

    # Evaluar el modelo
    y_pred = realizar_predicciones(modelo, X_test)
    print("Reporte de clasificación:\n", classification_report(y_test, y_pred))

    # Guardar el modelo entrenado
    modelo.save("modelo_clasificacion_riesgo.h5")
    print("Modelo guardado como 'modelo_clasificacion_riesgo.h5'")

    # Ejemplo de predicción con nuevos datos
    nuevos_datos = np.array([[valor1, valor2, valor3, ...]])  # Sustituir con nuevos valores
    nuevos_datos = scaler.transform(nuevos_datos)  # Estandarizar
    predicciones = realizar_predicciones(modelo, nuevos_datos)
    print("Predicciones para nuevos datos:", predicciones)
