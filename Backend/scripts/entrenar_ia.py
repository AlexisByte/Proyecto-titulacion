import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from datetime import datetime
import os
import json
import importlib.util
import numpy as np
import joblib
import shutil
import time

def detectar_delimitador(dataset_path):
    """
    Detecta el delimitador de un archivo CSV.
    """
    with open(dataset_path, 'r', encoding='utf-8') as f:
        primera_linea = f.readline()
        if ',' in primera_linea:
            return ','
        elif ';' in primera_linea:
            return ';'
        else:
            raise ValueError("No se pudo detectar un delimitador válido (',' o ';').")

def cargar_modelo_desde_archivo(modelo_path):
    try:
        spec = importlib.util.spec_from_file_location("modelo_personalizado", modelo_path)
        modulo = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(modulo)
        return modulo.modelo
    except Exception as e:
        error_response = {"message": "Error al cargar el modelo.", "error": str(e)}
        print(json.dumps(error_response))
        sys.exit(1)

def entrenar_modelo(dataset_path, modelo, skip_columns=0, test_size=0.2, random_state=42, metadata_path=None):
    global scaler
    
    delimitador = detectar_delimitador(dataset_path)
    df = pd.read_csv(dataset_path, delimiter=delimitador)
    
    num_columns = df.shape[1]
    if skip_columns >= num_columns:
        raise ValueError(f"ERROR: No se pueden omitir {skip_columns} columnas, el dataset solo tiene {num_columns} columnas.")
    
    X = df.iloc[:, skip_columns:-1].values
    y = df.iloc[:, -1].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)
    
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    modelo.fit(X_train, y_train)
    y_pred = modelo.predict(X_test)
    
    # Cargar clases desde metadata si está disponible
    if metadata_path and os.path.exists(metadata_path):
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.loads(f.read())[0]
        clases_metadata = metadata.get("clases_columna_objetivo", [])
    else:
        clases_metadata = []

    # Obtener clases presentes en y_test
    clases_presentes = np.unique(y_test).tolist()

    # Para matriz de confusión: usar solo las clases presentes
    cm = confusion_matrix(y_test, y_pred, labels=clases_presentes)

    # Para mostrar en dashboard: usar las originales si existen
    clases = clases_metadata if clases_metadata else clases_presentes
        
    precision = precision_score(y_test, y_pred, average="weighted")
    exactitud = accuracy_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred, average="weighted")
    f1 = f1_score(y_test, y_pred, average="weighted")
    
    # Obtener nombre del modelo
    nombre_modelo = modelo.__class__.__name__
    os.makedirs("Modelos Entrenados", exist_ok=True)
    ruta_salida = os.path.join("Modelos Entrenados", f"{nombre_modelo}_entrenado_{datetime.now().strftime('%Y%m%d_%H%M')}.joblib")
    
    if hasattr(modelo, 'save_model') and callable(getattr(modelo, 'save_model', None)):
        modelo.save_model(
            ruta_salida,
            save_encoder=True,
            scaler=scaler,
            skip_columns=skip_columns
        )    
    else:
        joblib.dump({
            "modelo": modelo,
            "scaler": scaler,
            #"label_encoders": label_encoders,
            "skip_columns": skip_columns
        }, ruta_salida)
    
    resultados = {
        "Modelo": nombre_modelo,
        "clases": clases,  # todas las clases del problema
        "clases_presentes": clases_presentes, 
        "matriz_confusion": cm.tolist(),
        "exactitud": exactitud,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "path": ruta_salida
    }
    jsonresultados = json.dumps(resultados, indent=4)
    print(jsonresultados)
    return jsonresultados

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("ERROR: Debes proporcionar la ruta de un archivo CSV y la ruta de un archivo .py con el modelo para entrenar.")
        sys.exit(1)

    dataset_path = sys.argv[1]
    modelo_path = sys.argv[2]
    skip_columns = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].isdigit() else 0
    test_size = float(sys.argv[4]) if len(sys.argv) > 4 and 0.2 <= float(sys.argv[4]) <= 0.4 else 0.2
    random_state = int(sys.argv[5]) if len(sys.argv) > 5 and 40 <= int(sys.argv[5]) <= 100 else 42
    metadata_path = sys.argv[6] if len(sys.argv) > 6 else None

    modelo = cargar_modelo_desde_archivo(modelo_path)
    entrenar_modelo(dataset_path, modelo, skip_columns, test_size, random_state, metadata_path)

     # Eliminar carpeta __pycache__ si tiene más de 12 horas de antigüedad
    pycache_dir = os.path.join(os.path.dirname(modelo_path), "__pycache__")
    if os.path.exists(pycache_dir) and os.path.isdir(pycache_dir):
        try:
            tiempo_actual = time.time()
            tiempo_modificacion = os.path.getmtime(pycache_dir)
            horas_transcurridas = (tiempo_actual - tiempo_modificacion) / 3600  # segundos a horas

            if horas_transcurridas >= 12:
                shutil.rmtree(pycache_dir)
        except Exception as e:
            raise ValueError(f" No se pudo eliminar __pycache__: {str(e)}", file=sys.stderr)