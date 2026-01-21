import sys
import json
import pandas as pd
import joblib
import os

MODELO_PATH = "modelos/random_forest_equifax.joblib"

# -----------------------------------
# SCORE IA DESDE CLASE DEL MODELO
# -----------------------------------
def score_ia_desde_clase(clase):
    return {
        0: 85.0,  # Riesgo bajo
        1: 60.0,  # Riesgo medio
        2: 35.0   # Riesgo alto
    }.get(int(clase), 50.0)


# -----------------------------------
# CLASIFICACIÓN FINAL DE RIESGO
# -----------------------------------
def clasificar_riesgo(score_final):
    if score_final < 40:
        return "RIESGO ALTO"
    elif score_final < 70:
        return "RIESGO MEDIO"
    else:
        return "RIESGO BAJO"

# -----------------------------------
# GENERAR FACTORES NEGATIVOS
# -----------------------------------
def generar_factores_negativos(data):
    factores = []

    if data.get("num_operaciones_vencidas", 0) > 0:
        factores.append(f"{data['num_operaciones_vencidas']} operaciones vencidas")

    if data.get("saldo_vencido", 0) > 0:
        factores.append(f"Saldo vencido: ${data['saldo_vencido']}")

    if data.get("saldo_castigado", 0) > 0:
        factores.append(f"Cartera castigada: ${data['saldo_castigado']}")

    if data.get("max_dias_vencido"):
        factores.append(f"Máximo de días vencido: {data['max_dias_vencido']}")

    if data.get("vencidos_actuales"):
        factores.append(f"Vencidos actuales: ${data['vencidos_actuales']}")

    return factores

# -----------------------------------
# CARGA DE DATOS (ARCHIVO O STDIN)
# -----------------------------------
def cargar_entrada():
    # Caso 1: archivo JSON como argumento
    if len(sys.argv) > 1:
        ruta = sys.argv[1]
        if not os.path.exists(ruta):
            raise FileNotFoundError(f"Archivo no encontrado: {ruta}")

        with open(ruta, "r", encoding="utf-8") as f:
            return json.load(f)

    # Caso 2: STDIN (Node.js)
    entrada = sys.stdin.read().strip()
    if not entrada:
        raise ValueError("No se recibió entrada JSON")

    return json.loads(entrada)


def main():
    # -----------------------------
    # ENTRADA
    # -----------------------------
    data = cargar_entrada()

    # -----------------------------
    # 1️⃣ SCORE POR REGLAS
    # -----------------------------
    score_reglas = float(data.get("score_reglas", 0.0))

    # -----------------------------
    # 2️⃣ SCORE IA (Random Forest)
    # -----------------------------
    if os.path.exists(MODELO_PATH):
        modelo = joblib.load(MODELO_PATH)

        df = pd.DataFrame([{
            "num_operaciones_vencidas": data.get("num_operaciones_vencidas", 0),
            "saldo_vencido": data.get("saldo_vencido", 0.0),
            "saldo_castigado": data.get("saldo_castigado", 0.0),
            "operaciones_castigadas": data.get("operaciones_castigadas", 0),
            "operaciones_demanda_judicial": data.get("operaciones_demanda_judicial", 0)
        }])

        clase = int(modelo.predict(df)[0])
        score_ia = score_ia_desde_clase(clase)

    else:
        # Fallback elegante
        score_ia = score_reglas

    # -----------------------------
    # 3️⃣ SCORE FINAL
    # -----------------------------
    score_final = round(
        (score_reglas * 0.6) +
        (score_ia * 0.4),
        2
    )

    # -----------------------------
    # 4️⃣ RIESGO
    # -----------------------------
    riesgo = clasificar_riesgo(score_final)

    salida = {
        "score_reglas": score_reglas,
        "score_ia": score_ia,
        "score_final": score_final,
        "riesgo": riesgo
    }
    
    # 5️⃣ FACTORES NEGATIVOS
    factores_negativos = generar_factores_negativos(data)

    salida = {
        "score_reglas": score_reglas,
        "score_ia": score_ia,
        "score_final": score_final,
        "riesgo": riesgo,
        "factores_negativos": factores_negativos
    }

    print(json.dumps(salida, indent=2))


if __name__ == "__main__":
    main()
