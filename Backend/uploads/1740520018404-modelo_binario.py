import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.feature_selection import SelectKBest, f_classif
import pickle
import json
from tqdm import tqdm  # Importar tqdm

def entrenar_modelo(dataset_path, k_features="all", skip_columns=0):
    """
    Entrena un modelo de clasificación seleccionando las mejores características.

    Parámetros:
    - dataset_path (str): Ruta al archivo CSV con los datos de entrenamiento.
    - k_features (int o 'all'): Número de características a seleccionar. Si es 'all', se usan todas.
    - skip_columns (int): Número de columnas iniciales a omitir (Ej: ID, Nombre, etc.).

    Retorna:
    - Diccionario con métricas del modelo.
    """
    global model, scaler, selector  # Usamos variables globales

    #  1️⃣ Cargar el dataset
    df = pd.read_csv(dataset_path)

    #  2️⃣ Verificar que `skip_columns` no exceda el número de columnas disponibles
    num_columns = df.shape[1]
    if skip_columns >= num_columns:
        raise ValueError(f"ERROR: No se pueden omitir {skip_columns} columnas, el dataset solo tiene {num_columns} columnas.")

    #  3️⃣ Separar características (X) y etiquetas (y)
    X = df.iloc[:, skip_columns:-1].values  # Excluir las primeras `skip_columns` y la última columna (etiqueta)
    y = df.iloc[:, -1].values  # La última columna es la variable objetivo

    num_features = X.shape[1]  # Número real de características después de `skip_columns`

    #  4️⃣ Ajustar `k_features` si es 'all'
    if k_features == "all":
        k_features = num_features  # Tomar todas las características disponibles

    #  5️⃣ Verificar que hay suficientes columnas para seleccionar características
    if num_features < k_features:
        print(f" Advertencia: Solo hay {num_features} características después de omitir {skip_columns} columnas. Ajustando k_features a {num_features}.")
        k_features = num_features

    #  6️⃣ Seleccionar las K mejores características
    selector = SelectKBest(score_func=f_classif, k=k_features)
    X_selected = selector.fit_transform(X, y)

    #  7️⃣ Dividir datos en entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42)

    #  8️⃣ Normalizar los datos
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    #  9️⃣ Definir y entrenar el modelo con tqdm
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    with tqdm(total=len(X_train), desc="Entrenando el modelo", unit="fila") as pbar:
        model.fit(X_train, y_train)
        pbar.update(len(X_train))  # Actualizar la barra de progreso después del entrenamiento

    #   Evaluar el modelo
    y_pred = model.predict(X_test)

    # Matriz de confusión
    cm = confusion_matrix(y_test, y_pred)

    #  Cálculo de métricas generales (para multiclase)
    precision = precision_score(y_test, y_pred, average="weighted")
    exactitud = accuracy_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred, average="weighted")
    f1 = f1_score(y_test, y_pred, average="weighted")

    #  1️⃣1️⃣ Guardar el modelo entrenado
    with open("modelo_entrenado.pkl", "wb") as f:
        pickle.dump((model, scaler, selector), f)

    #  1️⃣2️⃣ Devolver métricas
    resultados = {
        "matriz_confusion": cm.tolist(),  # Convertir a lista para JSON
        "exactitud": exactitud,
        "precision": precision,
        "recall": recall,
        "f1_score": f1
    }
    jsonresultados=json.dumps(resultados)

    print(jsonresultados)

    return jsonresultados

def predecir(X_test):
    """
    Realiza predicciones usando el modelo previamente entrenado.

    Parámetros:
    - X_test (numpy array o pandas DataFrame): Datos de entrada.

    Retorna:
    - y_pred (numpy array): Predicciones.
    """
    global model, scaler, selector

    # 📌 1️⃣ Cargar el modelo si no está en memoria
    if model is None or scaler is None or selector is None:
        try:
            with open("modelo_entrenado.pkl", "rb") as f:
                model, scaler, selector = pickle.load(f)
            print(" Modelo cargado correctamente.")
        except FileNotFoundError:
            raise FileNotFoundError(" ERROR: No se encontró el archivo 'modelo_entrenado.pkl'. Primero entrena el modelo.")

    # 📌 2️⃣ Convertir DataFrame a numpy array si es necesario
    if isinstance(X_test, pd.DataFrame):
        X_test = X_test.values

    # 📌 3️⃣ Verificar que el número de características coincida
    expected_features = selector.get_support().sum()
    if X_test.shape[1] != expected_features:
        raise ValueError(f" ERROR: Se esperaban {expected_features} características, pero se recibieron {X_test.shape[1]}.")

    # 📌 4️⃣ Seleccionar y normalizar las características
    X_test_selected = selector.transform(X_test)
    X_test_scaled = scaler.transform(X_test_selected)

    # 📌 5️⃣ Hacer predicciones
    y_pred = model.predict(X_test_scaled)

    prediccion=json.dumps(y_pred)
    print(prediccion)
    
    return prediccion

# 📌 🔹 Permitir ejecución desde línea de comandos
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print(" ERROR: Debes proporcionar la ruta de un archivo CSV para entrenar el modelo.")
        sys.exit(1)

    dataset_path = sys.argv[1]
    k_features = sys.argv[2] if len(sys.argv) > 2 else "all"  # Número de características a seleccionar
    skip_columns = int(sys.argv[3]) if len(sys.argv) > 3 else 0  # Número de columnas a omitir

    if k_features != "all":
        k_features = int(k_features)  # Convertir a entero si no es "all"

    # 📌 Entrenar modelo
    resultados = entrenar_modelo(dataset_path, k_features, skip_columns)
