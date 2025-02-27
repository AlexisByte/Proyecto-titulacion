import pandas as pd
import sys
import os
from sklearn.preprocessing import LabelEncoder
import numpy as np
from datetime import datetime
import gc
from tqdm import tqdm

def procesar_dataset(ruta_archivo, chunk_size=20000, sample_for_categories=10000):
    """
    Procesa un dataset grande de manera eficiente usando chunks.
    
    Parámetros:
    - ruta_archivo: Ruta al archivo CSV
    - chunk_size: Tamaño de cada chunk para procesamiento
    - sample_for_categories: Número de filas a usar para determinar columnas categóricas
    
    Retorna:
    - Ruta del archivo procesado
    """
    
    if not os.path.exists(ruta_archivo):
        raise FileNotFoundError(f"El archivo {ruta_archivo} no existe.")
    
    # Crear nombre para archivo de salida
    ruta_salida = ruta_archivo.replace('.csv', f'_procesado_{datetime.now().strftime("%Y%m%d_%H%M")}.csv')
    
    # Verificar si el archivo es realmente grande
    file_size_mb = os.path.getsize(ruta_archivo) / (1024 * 1024)
    #logger.info(f"Tamaño del archivo: {file_size_mb:.2f} MB")
    
    # Para determinar las columnas categóricas, usamos una muestra pequeña
    #logger.info("Analizando estructura del dataset con una muestra...")
    sample_df = pd.read_csv(ruta_archivo, nrows=sample_for_categories)
    
    if sample_df.empty:
        raise ValueError("El dataset está vacío.")
    
    # Identificar columnas numéricas y categóricas
    columnas_categoricas = []
    columnas_numericas = []
    
    for col in sample_df.columns:
        # Si la columna tiene pocos valores únicos en comparación con el total,
        # probablemente sea categórica
        unique_count = sample_df[col].nunique()
        if sample_df[col].dtype == 'object' or (unique_count < 0.5 * len(sample_df) and unique_count < 100):
            columnas_categoricas.append(col)
        else:
            columnas_numericas.append(col)
    
    #logger.info(f"Columnas categóricas detectadas: {len(columnas_categoricas)}")
    #logger.info(f"Columnas numéricas detectadas: {len(columnas_numericas)}")
    
    # Inicializamos los encoders con la muestra completa para tener todos los valores posibles
    #logger.info("Inicializando encoders para columnas categóricas...")
    label_encoders = {}
    
    for col in columnas_categoricas:
        le = LabelEncoder()
        le.fit(sample_df[col].fillna('MISSING').astype(str))
        label_encoders[col] = le
    
    # Liberar memoria
    del sample_df
    gc.collect()
    
    # Procesar el dataset en chunks
    #logger.info(f"Procesando dataset en chunks de {chunk_size} filas...")
    
    # Escribir encabezados primero
    first_chunk = True
    total_rows = 0
    
    # Contar filas totales para la barra de progreso
    total_rows_estimate = sum(1 for _ in open(ruta_archivo, 'r')) - 1  # -1 para header
    
    with tqdm(total=total_rows_estimate, desc="Procesando filas") as pbar:
        for chunk in pd.read_csv(ruta_archivo, chunksize=chunk_size):
            # Contador de filas procesadas
            chunk_rows = len(chunk)
            total_rows += chunk_rows
            
            # Reemplazar NaN basado en el tipo de columna
            for col in columnas_numericas:
                if col in chunk.columns:
                    chunk[col] = chunk[col].fillna(0)
            
            # Procesar columnas categóricas
            for col in columnas_categoricas:
                if col in chunk.columns:
                    # Manejar valores no vistos durante el entrenamiento
                    valores_actuales = set(chunk[col].fillna('MISSING').astype(str).unique())
                    valores_conocidos = set(label_encoders[col].classes_)
                    valores_desconocidos = valores_actuales - valores_conocidos
                    
                    if valores_desconocidos:
                        #logger.warning(f"Valores desconocidos en columna {col}: {valores_desconocidos}")
                        # Reentrenar el encoder con los nuevos valores
                        new_classes = np.append(label_encoders[col].classes_, list(valores_desconocidos))
                        le_new = LabelEncoder()
                        le_new.fit(new_classes)
                        label_encoders[col] = le_new
                    
                    # Aplicar encoding
                    chunk[col] = label_encoders[col].transform(chunk[col].fillna('MISSING').astype(str))
            
            # Guardar el chunk procesado
            if first_chunk:
                chunk.to_csv(ruta_salida, index=False, mode='w')
                first_chunk = False
            else:
                chunk.to_csv(ruta_salida, index=False, mode='a', header=False)
            
            # Liberar memoria
            del chunk
            gc.collect()
            
            # Actualizar barra de progreso
            pbar.update(chunk_rows)
    
    # Guardar información de los encoders para posible decodificación futura
    encoders_info = {}
    for col, encoder in label_encoders.items():
        encoders_info[col] = {
            'classes': encoder.classes_.tolist()
        }
    
    # Guardar metadatos del procesamiento
    metadata = {
        'archivo_original': ruta_archivo,
        'archivo_procesado': ruta_salida,
        'filas_procesadas': total_rows,
        'columnas_categoricas': columnas_categoricas,
        'columnas_numericas': columnas_numericas,
        'fecha_procesamiento': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    pd.DataFrame([metadata]).to_json(ruta_salida.replace('.csv', '_metadata.json'), orient='records')
    
    #logger.info(f"Procesamiento completado. Total de filas procesadas: {total_rows}")
    #logger.info(f"Archivo guardado en: {ruta_salida}")
    return ruta_salida

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