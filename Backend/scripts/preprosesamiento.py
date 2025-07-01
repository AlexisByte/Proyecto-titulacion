import pandas as pd
import sys
import os
from sklearn.preprocessing import LabelEncoder
import numpy as np
from datetime import datetime
import gc
from tqdm import tqdm

def detectar_delimitador(ruta_archivo, num_lineas=5):
    """
    Detecta el delimitador del archivo CSV probando ',' y ';'.
    """
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        lineas = [next(f) for _ in range(num_lineas)]
    
    if all(',' in linea for linea in lineas):
        return ','
    elif all(';' in linea for linea in lineas):
        return ';'
    else:
        raise ValueError("No se pudo determinar el delimitador. Asegúrate de que el archivo esté correctamente formateado.")

def procesar_dataset(ruta_archivo, chunk_size=20000, sample_for_categories=10000):
    """
    Procesa un dataset grande de manera eficiente usando chunks, detectando el delimitador automáticamente.
    """
    if not os.path.exists(ruta_archivo):
        raise FileNotFoundError(f"El archivo {ruta_archivo} no existe.")
    
    delimitador = detectar_delimitador(ruta_archivo)
    ruta_salida = ruta_archivo.replace('.csv', f'_procesado_{datetime.now().strftime("%Y%m%d_%H%M")}.csv')
    
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        total_rows_estimate = sum(1 for _ in f) - 1
    
    if total_rows_estimate < 20000:
        chunk_size = max(1, total_rows_estimate // 2)
    
    sample_df = pd.read_csv(ruta_archivo, nrows=sample_for_categories, sep=delimitador, low_memory=False)
    
    if sample_df.empty:
        raise ValueError("El dataset está vacío.")
    
    ########
# Reemplazar strings vacíos y valores incorrectos con np.nan
    sample_df.replace(['_', 'NA', 'na', 'N/A', 'n/a', '', 'null', 'Null'], np.nan, inplace=True)
    sample_df.replace(r'[^0-9A-Za-z.,\- ]+', np.nan, regex=True, inplace=True)
    sample_df = sample_df.infer_objects(copy=False)  # para evitar FutureWarning
    
    # Eliminar espacios y limpiar nombres de columnas
    sample_df.columns = sample_df.columns.str.strip()
    
    # Convertir columnas numéricas (donde aplica) a float
    for col in sample_df.columns:
        try:
            sample_df[col] = sample_df[col].str.replace(',', '', regex=False)
            sample_df[col] = sample_df[col].astype(float)
        except:
            pass  # No se puede convertir => categórica
    
    # Rellenar NaNs con valor mínimo de cada columna
    for col in sample_df.columns:
        if sample_df[col].dtype in [np.float64, np.int64]:
            sample_df[col] = sample_df[col].fillna(sample_df[col].min())
        else:
            sample_df[col] = sample_df[col].fillna(sample_df[col].mode()[0] if not sample_df[col].mode().empty else 'Unknown')
    ################
    
    columnas_categoricas, columnas_numericas = [], []
    for col in sample_df.columns:
        unique_count = sample_df[col].nunique()
        # Detectar columnas categóricas
        if sample_df[col].dtype == 'object' or (unique_count < 0.5 * len(sample_df) and unique_count < 100):
            columnas_categoricas.append(col)
        # Detectar columnas numéricas
        elif sample_df[col].dtype in ['int64', 'float64']:
            columnas_numericas.append(col)
        # Si la columna tiene valores numéricos pero está representada como texto
        elif sample_df[col].dtype == 'object' and sample_df[col].str.replace('.', '', regex=False).str.isnumeric().all():
            columnas_numericas.append(col)
    
    label_encoders = {}
    for col in columnas_categoricas:
        le = LabelEncoder()
        le.fit(sample_df[col].fillna('MISSING').astype(str))
        label_encoders[col] = le
    
    del sample_df
    gc.collect()
    
    first_chunk, total_rows = True, 0
    total_rows_estimate = sum(1 for _ in open(ruta_archivo, 'r')) - 1
    
    with tqdm(total=total_rows_estimate, desc="Procesando filas") as pbar:
        for chunk in pd.read_csv(ruta_archivo, chunksize=chunk_size, sep=delimitador, low_memory=False):
            chunk_rows = len(chunk)
            total_rows += chunk_rows
            
            # 🔹 Limpieza general de valores inválidos en cada chunk
            chunk.replace(['_', 'NA', 'na', 'N/A', 'n/a', '', 'null', 'Null'], np.nan, inplace=True)
            chunk.replace(r'[^0-9A-Za-z.,\- ]+', np.nan, regex=True, inplace=True)
            
             # 🔹 Limpieza y conversión de columnas numéricas
            for col in columnas_numericas:
                if col in chunk.columns:
                    chunk[col] = chunk[col].astype(str).str.replace(r'[^0-9.\-]', '', regex=True)
                    chunk[col] = pd.to_numeric(chunk[col], errors='coerce').fillna(0)

            # 🔹 Limpieza y codificación de columnas categóricas
            for col in columnas_categoricas:
                if col in chunk.columns:
                    valores_actuales = set(chunk[col].fillna('MISSING').astype(str).unique())
                    valores_conocidos = set(label_encoders[col].classes_)
                    valores_desconocidos = valores_actuales - valores_conocidos

                    if valores_desconocidos:
                        new_classes = np.append(label_encoders[col].classes_, list(valores_desconocidos))
                        le_new = LabelEncoder()
                        le_new.fit(new_classes)
                        label_encoders[col] = le_new

                    chunk[col] = label_encoders[col].transform(chunk[col].fillna('MISSING').astype(str))

            # 🔹 Guardar el chunk al archivo de salida
            if first_chunk:
                chunk.to_csv(ruta_salida, index=False, mode='w', sep=delimitador)
                first_chunk = False
            else:
                chunk.to_csv(ruta_salida, index=False, mode='a', header=False, sep=delimitador)

            del chunk
            gc.collect()
            pbar.update(chunk_rows)
    
    metadata = {
        'archivo_original': ruta_archivo,
        'archivo_procesado': ruta_salida,
        'filas_procesadas': total_rows,
        'columnas_categoricas': columnas_categoricas,
        'columnas_numericas': columnas_numericas,
        'fecha_preprocesamiento': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Ruta donde se guardará la metadata
    ruta_metadata = ruta_salida.replace('.csv', '_metadata.json')

    # Guardar el archivo de metadata en disco
    with open(ruta_metadata, 'w', encoding='utf-8') as f:
        json_str = pd.DataFrame([metadata]).to_json(orient='records')
        f.write(json_str)

    # Retornar la ruta como string
    return ruta_metadata

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python script.py ruta_al_dataset.csv [chunk_size]")
        sys.exit(1)
    
    ruta_csv = sys.argv[1]
    chunk_size = int(sys.argv[2]) if len(sys.argv) > 2 else 100000
    
    try:
        ruta_procesada = procesar_dataset(ruta_csv, chunk_size=chunk_size)
        print(ruta_procesada)
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)
