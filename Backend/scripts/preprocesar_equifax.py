import pdfplumber
import re
import sys
import os
import pandas as pd
from datetime import datetime
from pdf2image import convert_from_path
import pytesseract
import platform
import json

# -------------------------
# CONFIGURACIÓN MULTI-OS
# -------------------------
SISTEMA = platform.system().lower()

if SISTEMA == "windows":
    POPPLER_PATH = r"C:\poppler\Library\bin"
    TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
else:
    POPPLER_PATH = "/usr/bin"
    TESSERACT_CMD = "/usr/bin/tesseract"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD


# -------------------------
# UTILIDADES
# -------------------------
def to_float(valor):
    if not valor:
        return 0.0
    valor = valor.replace('.', '').replace(',', '.')
    try:
        return float(valor)
    except:
        return 0.0


def buscar_triple_int(nombre, texto):
    patron = rf"{nombre}\s+(\d+)\s+(\d+)\s+(\d+)"
    m = re.search(patron, texto, re.IGNORECASE)
    if m:
        return max(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    return 0


def buscar_triple_float(nombre, texto):
    patron = rf"{nombre}\s+([\d\.,]+)\s+([\d\.,]+)\s+([\d\.,]+)"
    m = re.search(patron, texto, re.IGNORECASE)
    if m:
        return (
            to_float(m.group(1)) +
            to_float(m.group(2)) +
            to_float(m.group(3))
        )
    return 0.0


def buscar_flexible_int(nombre, texto):
    patrones = [
        rf"{nombre}\s*[:\-]?\s*(\d+)",
        rf"{nombre}\s+(\d+)",
        rf"{nombre}.*?(\d{{2,4}})"
    ]
    for patron in patrones:
        m = re.search(patron, texto, re.IGNORECASE | re.DOTALL)
        if m:
            try:
                return int(m.group(1))
            except:
                pass
    return 0


# -------------------------
# VALIDACIÓN DE REGISTRO EQUIFAX
# -------------------------
def es_registro_equifax_valido(r):
    if r.get("score_equifax", 0) <= 0:
        return False
    if r.get("numero_documento", 0) <= 0:
        return False

    indicadores = [
        r.get("num_ops_historicas", 0),
        r.get("saldo_vencido", 0),
        r.get("saldo_castigado", 0),
        r.get("saldo_demanda", 0)
    ]

    return any(v > 0 for v in indicadores)


# -------------------------
# EXTRACCIÓN TEXTO PDF
# -------------------------
def extraer_texto_pdf(pdf_path):
    texto = ""

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    texto += t + "\n"
    except:
        pass

    if len(texto.strip()) < 100:
        try:
            images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
            for img in images:
                texto += pytesseract.image_to_string(img, lang='spa') + "\n"
        except:
            pass

    return texto


# -------------------------
# EXTRACCIÓN TEXTO XML
# -------------------------
def extraer_texto_xml(xml_path):
    try:
        with open(xml_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except:
        return ""


# -------------------------
# EXTRACCIÓN VARIABLES
# -------------------------
def extraer_registro(texto):
    data = {}

    data["numero_documento"] = buscar_flexible_int("Número de documento", texto)

    nombre = re.search(
        r"\n([A-ZÁÉÍÓÚÑ ]{8,})\n",
        texto
    )
    data["nombre_titular"] = nombre.group(1).strip() if nombre else ""

    data["score_equifax"] = buscar_flexible_int("Score", texto)

    data["num_ops_historicas"] = buscar_triple_int("Históricas", texto)
    data["num_ops_vigentes"] = buscar_triple_int("Vigentes", texto)
    data["num_ops_vencidas"] = buscar_triple_int("Vencidas", texto)

    data["saldo_por_vencer"] = buscar_triple_float("Por Vencer", texto)
    data["nuevos_creditos"] = buscar_triple_float("Nuevos Créditos", texto)

    data["saldo_vencido"] = buscar_triple_float("Vencido Actual", texto)
    data["saldo_demanda"] = buscar_triple_float("Demanda Judicial", texto)
    data["saldo_castigado"] = buscar_triple_float("En Castigo", texto)

    dias_actual = buscar_triple_int("días vencidos actuales", texto)
    dias_hist = buscar_triple_int("días vencidos históricos", texto)
    data["max_dias_vencido"] = max(dias_actual, dias_hist)

    data["total_saldo_negativo"] = (
        data["saldo_vencido"] +
        data["saldo_demanda"] +
        data["saldo_castigado"]
    )

    data["ratio_morosidad"] = data["num_ops_vencidas"] / (
        data["num_ops_historicas"] + 1
    )

    return data


# -------------------------
# MAIN
# -------------------------
def main(rutas):
    registros = []

    for ruta in rutas:
        ext = ruta.lower().split('.')[-1]

        if ext == "pdf":
            texto = extraer_texto_pdf(ruta)
        elif ext == "xml":
            texto = extraer_texto_xml(ruta)
        else:
            continue

        if len(texto.strip()) < 100:
            continue

        bloques = re.split(r"Número de documento", texto)

        for bloque in bloques[1:]:
            registro = extraer_registro("Número de documento" + bloque)

            if es_registro_equifax_valido(registro):
                registros.append(registro)

    if len(registros) == 0:
        raise ValueError("No se encontraron registros Equifax válidos.")

    df = pd.DataFrame(registros)

    output_dir = "datasets_equifax_procesados"
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(
        output_dir,
        f"equifax_dataset_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )

    df.to_csv(output_path, index=False)

    resultado = {
        "archivo_csv": output_path,
        "total_registros": len(df),
        "score_equifax_promedio": round(float(df["score_equifax"].mean()), 2)
    }

    print(json.dumps(resultado))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Debe enviar al menos un PDF o XML Equifax"}))
        sys.exit(1)

    try:
        main(sys.argv[1:])
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
