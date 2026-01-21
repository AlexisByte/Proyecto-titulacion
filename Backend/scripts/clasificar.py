import sys
import os
import pandas as pd
import joblib
import numpy as np
from datetime import datetime
from tqdm import tqdm
import gc
import json  
from collections import Counter
import time  # ya que vas a medir en segundos

def detectar_delimitador(ruta_archivo, num_lineas=5):
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        lineas = [next(f) for _ in range(num_lineas)]
    if all(',' in linea for linea in lineas):
        return ','
    elif all(';' in linea for linea in lineas):
        return ';'
    else:
        raise ValueError("No se pudo determinar el delimitador.")

def clasificar_en_chunks(modelo_path, metadata_path, metadata_ruta_csv, chunk_size=20000):
    inicio = time.time()
    if not os.path.exists(modelo_path) or not os.path.exists(metadata_ruta_csv) or not os.path.exists(metadata_path):
        raise FileNotFoundError("Archivo de modelo, CSV o metadata no encontrado.")

    # Cargar modelo y transformadores
    datos = joblib.load(modelo_path)
    modelo = datos["modelo"]
    scaler = datos["scaler"]
    label_encoders = datos.get("label_encoders", {})
    skip_columns = datos.get("skip_columns", 0)

    # Leer metadata JSON
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)[0]

    columna_objetivo = metadata["columna_objetivo"]
    clases = metadata["clases_columna_objetivo"]
    
    # Leer metadata CSV JSON
    with open(metadata_ruta_csv, 'r', encoding='utf-8') as f:
        metadata_csv = json.load(f)[0]
    archivo_procesado = metadata_csv["archivo_procesado"]
    archivo_original = metadata_csv["archivo_original"]

    # Validar existencia de archivos
    if not os.path.exists(archivo_procesado) or not os.path.exists(archivo_original):
        raise FileNotFoundError("No se encontró archivo_procesado o archivo_original especificado en metadata.")

    # Preparar archivo de salida
    nombre_base = os.path.splitext(os.path.basename(archivo_original))[0]
    fecha_actual = datetime.now().strftime("%Y%m%d_%H%M%S")
    salida_csv = f"clasificados/{nombre_base}_clasificado_{fecha_actual}.csv"
    os.makedirs("clasificados", exist_ok=True)

    # Detectar delimitador
    delimitador = detectar_delimitador(archivo_procesado)

    # Contar filas
    with open(archivo_procesado, 'r', encoding='utf-8') as f:
        total_filas = sum(1 for _ in f) - 1
    if total_filas < chunk_size:
        chunk_size = max(total_filas // 2, 1)

    first_chunk = True
    todas_predicciones = []

    with tqdm(total=total_filas, desc="Clasificando") as pbar:
        chunk_iter = pd.read_csv(archivo_procesado, chunksize=chunk_size, sep=delimitador)
        chunk_original_iter = pd.read_csv(archivo_original, chunksize=chunk_size, sep=delimitador)

        for chunk, original_chunk in zip(chunk_iter, chunk_original_iter):
            X_chunk = chunk.iloc[:, skip_columns:]

            for col in X_chunk.columns:
                if col in label_encoders:
                    le = label_encoders[col]
                    X_chunk[col] = X_chunk[col].fillna('MISSING').astype(str)
                    desconocidos = set(X_chunk[col].unique()) - set(le.classes_)
                    if desconocidos:
                        le.classes_ = np.append(le.classes_, list(desconocidos))
                    X_chunk[col] = le.transform(X_chunk[col])
                else:
                    X_chunk[col] = X_chunk[col].fillna(0)

            X_scaled = scaler.transform(X_chunk)
            predicciones = modelo.predict(X_scaled)
            pred_clases = [clases[i] for i in predicciones]  # Convertir a etiquetas reales

            original_chunk[columna_objetivo] = pred_clases
            todas_predicciones.extend(pred_clases)

            original_chunk.to_csv(salida_csv, mode='a', index=False, header=first_chunk, sep=delimitador)
            first_chunk = False

            pbar.update(len(chunk))
            del chunk, original_chunk, X_chunk
            gc.collect()

    resumen = dict(Counter(todas_predicciones))
    total_filas_clasificadas = len(todas_predicciones)
    fin = time.time()
    tiempo_procesamiento = round(fin - inicio, 2)

    pdf_generado = None

    if total_filas_clasificadas <= 20:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas

        nombre_pdf = salida_csv.replace(".csv", ".pdf")
        c = canvas.Canvas(nombre_pdf, pagesize=A4)
        width, height = A4

        y = height - 50
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Informe de Clasificación Crediticia")
        y -= 30

        c.setFont("Helvetica", 11)
        for i, clase in enumerate(todas_predicciones, start=1):
            explicacion = {
                "good": "Perfil con bajo riesgo crediticio.",
                "standard": "Perfil con riesgo medio, requiere validación.",
                "poor": "Perfil con alto riesgo crediticio."
            }.get(clase, "Clasificación no determinada.")

            c.drawString(50, y, f"Registro {i}: {clase.upper()} → {explicacion}")
            y -= 18

            if y < 50:
                c.showPage()
                y = height - 50

        c.save()
        pdf_generado = nombre_pdf
    
    print(json.dumps({
        "archivo_salida": salida_csv,
        "archivo_pdf": pdf_generado,
        "resumen": resumen,
        "filas_clasificadas": total_filas_clasificadas,
        "tiempo_procesamiento_seg": tiempo_procesamiento
    }))
    


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({ "error": "Uso: python clasificar.py modelo.joblib metadata.json metadata.csv" }))
        sys.exit(1)

    modelo_path = sys.argv[1]
    metadata_path = sys.argv[2]
    metadata_ruta_csv = sys.argv[3]

    try:
        clasificar_en_chunks(modelo_path, metadata_path, metadata_ruta_csv)
    except Exception as e:
        print(json.dumps({ "error": str(e) }))
        sys.exit(1)
