import pdfplumber
import re
import json
import sys
from pdf2image import convert_from_path
import pytesseract
import os
from datetime import datetime
import csv

# -------------------------
# CONFIGURACIÓN OCR
# -------------------------
POPPLER_PATH = r"C:\poppler\Library\bin"
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


# -------------------------
# UTILIDADES CSV
# -------------------------
def guardar_csv(data, ruta_csv):
    with open(ruta_csv, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=data.keys())
        writer.writeheader()
        writer.writerow(data)


# -------------------------
# EXTRACCIÓN DE TEXTO
# -------------------------
def extraer_texto(ruta):
    texto = ""
    try:
        with pdfplumber.open(ruta) as pdf:
            for page in pdf.pages:
                t = page.extract_text(x_tolerance=3, y_tolerance=3)
                if t:
                    texto += t + "\n"
    except:
        pass

    if len(texto.strip()) < 100:
        images = convert_from_path(ruta, poppler_path=POPPLER_PATH)
        for img in images:
            texto += pytesseract.image_to_string(img, lang='spa') + "\n"

    return texto


# -------------------------
# PARSEO
# -------------------------
def to_float(valor):
    if not valor:
        return 0.0
    valor = valor.replace('.', '').replace(',', '.')
    try:
        return float(valor)
    except:
        return 0.0


def buscar_texto(patron, texto):
    m = re.search(patron, texto, re.IGNORECASE)
    return m.group(1).strip() if m else ""


def buscar_triple_int(nombre, texto):
    patron = rf"{nombre}\s+(\d+)\s+(\d+)\s+(\d+)"
    m = re.search(patron, texto, re.IGNORECASE)
    return max(map(int, m.groups())) if m else 0


def buscar_triple_float(nombre, texto):
    patron = rf"{nombre}\s+([\d\.,]+)\s+([\d\.,]+)\s+([\d\.,]+)"
    m = re.search(patron, texto, re.IGNORECASE)
    return sum(to_float(v) for v in m.groups()) if m else 0.0


def buscar_flexible_int(nombre, texto):
    patrones = [
        rf"{nombre}\s*[:\-]?\s*(\d+)",
        rf"{nombre}\s+(\d+)",
        rf"{nombre}.*?(\d{{2,4}})"
    ]
    for patron in patrones:
        m = re.search(patron, texto, re.IGNORECASE | re.DOTALL)
        if m:
            return int(m.group(1))
    return 0


# -------------------------
# EXTRACCIÓN DE DATOS
# -------------------------
def extraer_datos(texto):
    data = {
        "numero_documento": buscar_flexible_int("Número de documento", texto),
        "nombre": buscar_texto(r"([A-ZÁÉÍÓÚÑ ]{8,})\nNúmero de documento", texto),
        "score_equifax": buscar_flexible_int("Score", texto),

        "num_operaciones_historicas": buscar_triple_int("Históricas", texto),
        "num_operaciones_vigentes": buscar_triple_int("Vigentes", texto),
        "num_operaciones_vencidas": buscar_triple_int("Vencidas", texto),

        "saldo_por_vencer": buscar_triple_float("Por Vencer", texto),
        "saldo_vencido": buscar_triple_float("Vencido Actual", texto),
        "saldo_demanda": buscar_triple_float("Demanda Judicial", texto),
        "saldo_castigado": buscar_triple_float("En Castigo", texto),
        "vencidos_actuales": buscar_triple_float("Vencidos actuales", texto),

        "dias_vencidos_actual": buscar_triple_int("días vencidos actuales", texto),
        "dias_vencidos_historico": buscar_triple_int("días vencidos históricos", texto),
    }

    data["max_dias_vencido"] = max(
        data["dias_vencidos_actual"],
        data["dias_vencidos_historico"]
    )

    return data


# -------------------------
# SCORE POR REGLAS
# -------------------------
def calcular_score_reglas(data):
    if all([
        data["num_operaciones_vencidas"] == 0,
        data["saldo_vencido"] == 0,
        data["saldo_castigado"] == 0,
        data["saldo_demanda"] == 0,
        data["max_dias_vencido"] == 0
    ]):
        return 60.0

    score = 65
    penal = 0

    penal += min(data["num_operaciones_vencidas"] * 9, 30)
    penal += min(data["saldo_vencido"] / 500, 24)
    penal += min(data["saldo_demanda"] / 9000, 22)
    penal += min(data["saldo_castigado"] / 1000, 26)
    penal += min(data["max_dias_vencido"] / 50, 26)

    if data["score_equifax"] < 300:
        penal += 12
    elif data["score_equifax"] < 600:
        penal += 8
    elif data["score_equifax"] < 800:
        penal += 4
    else:
        penal -= 4

    score = max(7, min(100, score - penal))
    return round(score, 2)


# -------------------------
# RIESGO
# -------------------------
def clasificar_riesgo(score):
    if score < 35:
        return "RIESGO ALTO"
    elif score < 70:
        return "RIESGO MEDIO"
    return "RIESGO BAJO"


# -------------------------
# PROCESO PRINCIPAL
# -------------------------
def procesar_equifax(ruta_pdf):
    texto = extraer_texto(ruta_pdf)
    if len(texto.strip()) < 100:
        raise ValueError("No se pudo extraer texto del PDF")

    datos = extraer_datos(texto)

    score_reglas = calcular_score_reglas(datos)
    score_equifax = datos["score_equifax"]

    score_interno = round(
        (((score_equifax)/10) + score_reglas) / 2, 2
    ) if score_equifax > 0 else score_reglas

    riesgo = clasificar_riesgo(score_interno)

    return {
        "nombre_reporte": f"Reporte Equifax {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "score_equifax": score_equifax,
        "score_reglas": score_reglas,
        "score_interno": score_interno,
        "riesgo_final": riesgo,
        "datos_equifax": datos
    }


# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    ruta_pdf = sys.argv[1]

    try:
        resultado = procesar_equifax(ruta_pdf)

        os.makedirs("outputs", exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")

        json_path = f"outputs/equifax_{ts}.json"
        csv_path = f"outputs/equifax_{ts}.csv"

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(resultado, f, indent=2, ensure_ascii=False)

        guardar_csv(resultado, csv_path)

        print(json.dumps({
            "status": "ok",
            "archivo_json": json_path,
            "archivo_csv": csv_path
        }, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))
        sys.exit(1)
