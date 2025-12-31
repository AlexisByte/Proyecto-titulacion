from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
import numpy as np
import joblib
from sklearn.model_selection import GridSearchCV

class MultiClassClassifier:
    def __init__(self):
        self.model = MLPClassifier(max_iter=20000, random_state=42, verbose=False)
        self.encoder = LabelEncoder()

    def fit(self, X_train, y_train, grid_search=False):
        if not np.issubdtype(y_train.dtype, np.number):
            y_encoded = self.encoder.fit_transform(y_train)
        else:
            self.encoder.fit(y_train)
            y_encoded = y_train

        if grid_search:
            param_grid = {
                'hidden_layer_sizes': [(128,), (128, 64), (128, 64, 32)],
                'activation': ['relu', 'tanh'],
                'solver': ['adam', 'lbfgs'],
                'learning_rate_init': [0.001, 0.01, 0.05],
                'alpha': [0.0001, 0.001, 0.01]
            }
            grid = GridSearchCV(self.model, param_grid, cv=3, verbose=1, n_jobs=-1)
            grid.fit(X_train, y_encoded)
            self.model = grid.best_estimator_
            print("Mejores parámetros:", grid.best_params_)
        else:
            self.model.fit(X_train, y_encoded)

        return self

    def predict(self, X):
        predictions = self.model.predict(X)
        if hasattr(self.encoder, 'classes_') and len(self.encoder.classes_) > 0:
            if predictions.dtype != self.encoder.classes_.dtype:
                predictions = predictions.astype(self.encoder.classes_.dtype)
            if np.issubdtype(predictions.dtype, np.number) and not np.array_equal(np.unique(predictions), self.encoder.classes_):
                return self.encoder.inverse_transform(predictions)
        return predictions

    def save_model(self, filepath, pipeline=None, save_encoder=False, scaler=None, skip_columns=0):
        model_data = {
            'modelo': self.model,
            'skip_columns': skip_columns
        }

        if pipeline:
            model_data['pipeline'] = pipeline

        if save_encoder:
            model_data['encoder'] = self.encoder

        if scaler is not None:
            model_data['scaler'] = scaler

        joblib.dump(model_data, filepath)


modelo = MultiClassClassifier()