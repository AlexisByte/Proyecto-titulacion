import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_classif

# 📌 🔹 Variables globales
model = None  # Aquí se almacenará el modelo entrenado
scaler = None  # Para escalar los datos
selector = None  # Para la selección de características


def entrenar_modelo(dataset_path, k_features=5):
    """
    Entrena un modelo de clasificación binaria seleccionando las mejores características.
    
    Parámetros:
    - dataset_path (str): Ruta al archivo CSV con los datos de entrenamiento.
    - k_features (int): Número de características más relevantes a seleccionar.
    
    Retorna:
    - None (guarda el modelo en un archivo .pkl)
    """
    global model, scaler, selector  # Usamos las variables globales

    # 📌 1️⃣ Cargar el dataset
    df = pd.read_csv(dataset_path)

    # 📌 2️⃣ Separar características (X) y etiquetas (y)
    X = df.iloc[:, :-1].values  # Todas las columnas excepto la última
    y = df.iloc[:, -1].values   # La última columna es la variable objetivo (0 o 1)

    # 📌 3️⃣ Seleccionar las K mejores características
    selector = SelectKBest(score_func=f_classif, k=min(k_features, X.shape[1]))
    X_selected = selector.fit_transform(X, y)

    # 📌 4️⃣ Dividir datos en entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42)

    # 📌 5️⃣ Normalizar los datos
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # 📌 6️⃣ Definir y entrenar el modelo
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 📌 7️⃣ Guardar el modelo entrenado en un archivo
    with open("modelo_entrenado.pkl", "wb") as f:
        pickle.dump((model, scaler, selector), f)

    print("✅ Modelo entrenado y guardado en 'modelo_entrenado.pkl'.")


def predecir(X_test):
    """
    Realiza predicciones usando el modelo previamente entrenado.

    Parámetros:
    - X_test (numpy array): Datos de entrada (mismas características usadas en el entrenamiento).

    Retorna:
    - y_pred (numpy array): Predicciones (0 o 1).
    """
    global model, scaler, selector

    # 📌 🔹 Asegurarse de que el modelo está cargado
    if model is None or scaler is None or selector is None:
        try:
            with open("modelo_entrenado.pkl", "rb") as f:
                model, scaler, selector = pickle.load(f)
            print("✅ Modelo cargado correctamente.")
        except FileNotFoundError:
            raise Exception("❌ ERROR: No se encontró el archivo 'modelo_entrenado.pkl'. Primero entrena el modelo.")

    # 📌 🔹 Seleccionar las mismas características
    X_test_selected = selector.transform(X_test)

    # 📌 🔹 Normalizar los datos de entrada
    X_test_scaled = scaler.transform(X_test_selected)

    # 📌 🔹 Hacer predicciones
    y_pred = model.predict(X_test_scaled)

    return y_pred


# 📌 🔹 Permitir la ejecución desde línea de comandos
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("❌ ERROR: Debes proporcionar la ruta de un archivo CSV para entrenar el modelo.")
        sys.exit(1)

    dataset_path = sys.argv[1]
    k_features = int(sys.argv[2]) if len(sys.argv) > 2 else 5  # Número de características a seleccionar
    entrenar_modelo(dataset_path, k_features)
