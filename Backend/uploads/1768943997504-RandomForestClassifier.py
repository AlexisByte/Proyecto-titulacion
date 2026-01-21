from sklearn.ensemble import RandomForestClassifier

modelo = RandomForestClassifier(
    n_estimators=200,      # Más árboles para estabilidad
    max_depth=35,          # Mayor profundidad para capturar más patrones
    min_samples_split=3,   # Evita overfitting
    min_samples_leaf=2,    # Evita ramas muy pequeñas
    max_features="sqrt",   # Reduce correlación entre árboles
    bootstrap=True,        # Muestra aleatoria para cada árbol
    random_state=42
)
