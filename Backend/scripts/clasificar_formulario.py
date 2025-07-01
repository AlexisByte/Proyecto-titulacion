import sys
import os
import pandas as pd
import joblib
import numpy as np
import json

def detectar_delimitador(ruta_archivo):
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        linea = f.readline()
    if ',' in linea and ';' not in linea:
        return ','
    elif ';' in linea and ',' not in linea:
        return ';'
    else:
        raise ValueError("No se pudo determinar el delimitador.")

def clasificar_fila(modelo_path, metadata_path, fila_csv_path):
    if not os.path.exists(modelo_path):
        raise FileNotFoundError("Modelo no encontrado.")
    if not os.path.exists(metadata_path):
        raise FileNotFoundError("Metadata del dataset no encontrada.")
    if not os.path.exists(fila_csv_path):
        raise FileNotFoundError("Archivo CSV del formulario no encontrado.")

    # Cargar modelo y transformadores
    datos = joblib.load(modelo_path)
    modelo = datos["modelo"]
    scaler = datos["scaler"]
    label_encoders = datos.get("label_encoders", {})
    skip_columns = datos.get("skip_columns", 0)

    # Cargar metadata
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)[0]

    clases = metadata["clases_columna_objetivo"]
    columna_objetivo = metadata.get("columna_objetivo", "prediccion")

    # Detectar delimitador
    delimitador = detectar_delimitador(fila_csv_path)

    # Leer solo 1 fila con cabecera
    df = pd.read_csv(fila_csv_path, sep=delimitador)
    if df.shape[0] != 1:
        raise ValueError("El archivo debe contener exactamente una fila de datos.")

    X = df.iloc[:, skip_columns:]

    # Codificar variables categóricas si es necesario
    for col in X.columns:
        if col in label_encoders:
            le = label_encoders[col]
            X[col] = X[col].fillna('MISSING').astype(str)
            desconocidos = set(X[col].unique()) - set(le.classes_)
            if desconocidos:
                le.classes_ = np.append(le.classes_, list(desconocidos))
            X[col] = le.transform(X[col])
        else:
            X[col] = X[col].fillna(0)

    # Escalar y predecir
    X_scaled = scaler.transform(X)
    pred = modelo.predict(X_scaled)[0]
    clase = clases[pred]

    print(json.dumps({
        "prediccion": clase,
        "columna_objetivo": columna_objetivo
    }))


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({ "error": "Uso: python clasificar_formulario.py modelo.joblib metadata.json fila.csv" }))
        sys.exit(1)

    modelo_path = sys.argv[1]
    metadata_path = sys.argv[2]
    fila_csv_path = sys.argv[3]

    try:
        clasificar_fila(modelo_path, metadata_path, fila_csv_path)
    except Exception as e:
        print(json.dumps({ "error": str(e) }))
        sys.exit(1)
