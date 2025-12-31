from sklearn.ensemble import GradientBoostingClassifier

modelo = GradientBoostingClassifier(
    n_estimators=100,      # Más iteraciones para mejor aprendizaje
    learning_rate=0.05,    # Reduce el peso de cada árbol (mejor ajuste)
    max_depth=20,          # Mayor profundidad para patrones complejos
    min_samples_split=3,   # Controla el crecimiento de los árboles
    min_samples_leaf=2,    # Evita ramas muy pequeñas
    subsample=0.8,         # Usa una fracción del dataset para cada árbol
    random_state=42
)
