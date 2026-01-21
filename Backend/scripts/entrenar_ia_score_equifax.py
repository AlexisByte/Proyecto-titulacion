import pandas as pd
import numpy as np
import json
import sys
import os
import joblib
import importlib.util
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# -----------------------------
# UTILIDADES
# -----------------------------
def normalizar(x):
    return (x - np.min(x)) / (np.max(x) - np.min(x) + 1e-9)


def detectar_delimitador(path):
    with open(path, "r", encoding="utf-8") as f:
        linea = f.readline()
        return ";" if ";" in linea else ","


def cargar_modelo_desde_archivo(modelo_path):
    spec = importlib.util.spec_from_file_location("modelo_ia", modelo_path)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)

    if not hasattr(modulo, "crear_modelo"):
        raise ValueError("El modelo IA debe exponer crear_modelo()")

    return modulo.crear_modelo()


# -----------------------------
# ENTRENAMIENTO SCORE
# -----------------------------
def entrenar_modelo(
    dataset_path,
    modelo_path,
    skip_columns=0,
    alpha=0.7,
    n_components_pca=6
):
    delimitador = detectar_delimitador(dataset_path)
    df = pd.read_csv(dataset_path, delimiter=delimitador)

    if "score_equifax" not in df.columns:
        raise ValueError("El dataset debe contener la columna 'score_equifax'")

    # Target de referencia
    score_eq = df["score_equifax"].astype(float).values

    # Features
    columnas_excluir = ["score_equifax", "nombre", "numero_documento"]
    X = df.drop(columns=[c for c in columnas_excluir if c in df.columns], errors="ignore")
    X = X.select_dtypes(include=[np.number])

    if skip_columns > 0:
        X = X.iloc[:, skip_columns:]

    if X.shape[1] < 3:
        raise ValueError("Muy pocas features para entrenar score IA")

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # PCA → riesgo latente
    pca = PCA(n_components=min(n_components_pca, X_scaled.shape[1]))
    riesgo_latente = pca.fit_transform(X_scaled)

    riesgo_score = normalizar(riesgo_latente[:, 0])

    # MODELO IA DINÁMICO
    modelo = cargar_modelo_desde_archivo(modelo_path)
    modelo.fit(riesgo_latente, riesgo_score)

    score_ia = normalizar(modelo.predict(riesgo_latente)) * 998 + 1
    score_eq_norm = normalizar(score_eq) * 998 + 1

    score_final = alpha * score_ia + (1 - alpha) * score_eq_norm

    # -----------------------------
    # MÉTRICAS DE SCORE
    # -----------------------------
    mae = mean_absolute_error(score_eq_norm, score_ia)
    rmse = mean_squared_error(score_eq_norm, score_ia, squared=False)
    r2 = r2_score(score_eq_norm, score_ia)
    desviacion_media = np.mean(np.abs(score_ia - score_eq_norm))

    # -----------------------------
    # GUARDADO
    # -----------------------------
    os.makedirs("Modelos Entrenados", exist_ok=True)
    modelo_entrenado = os.path.join(
        "Modelos Entrenados",
        f"score_ia_{modelo.__class__.__name__}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.joblib"
    )

    joblib.dump({
        "modelo": modelo,
        "scaler": scaler,
        "pca": pca,
        "alpha": alpha,
        "features": X.columns.tolist(),
        "tipo": "score_ia"
    }, modelo_entrenado)

    # -----------------------------
    # SALIDA UNIFICADA
    # -----------------------------
    resultado = {
        "modelo_entrenado": modelo_entrenado,
        "Error promedio": round(mae, 2),
        "Penaliza errores grandes": round(rmse, 2),
        "Correlación": round(r2, 4),
        "desviacion_media_equifax": round(desviacion_media, 2)
    }

    print(json.dumps({ "resultado": resultado }, indent=4))
# -----------------------------
# MAIN
# -----------------------------
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Uso: python entrenar_ia_score_equifax.py <dataset.csv> <modelo.py>"
        }, indent=4))
        sys.exit(1)

    dataset_path = sys.argv[1]
    modelo_path = sys.argv[2]

    entrenar_modelo(
        dataset_path=dataset_path,
        modelo_path=modelo_path
    )
