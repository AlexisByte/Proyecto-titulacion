from sklearn.ensemble import RandomForestClassifier

def crear_modelo():
    return RandomForestClassifier(
        n_estimators=200,
        max_depth=35,
        min_samples_split=3,
        min_samples_leaf=2,
        max_features="sqrt",
        bootstrap=True,
        random_state=42
    )
