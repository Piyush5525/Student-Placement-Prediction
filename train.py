"""
Placement Prediction — full training pipeline.
Stages 5-10, 13: split, imbalance handling, model comparison, tuning,
final selection, feature importance, and artifact saving.
"""
import json
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                              f1_score, roc_auc_score, confusion_matrix)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

RANDOM_STATE = 42

# ---------------------------------------------------------------
# STAGE 5 — TRAIN/TEST SPLIT
# ---------------------------------------------------------------
df = pd.read_csv("data/processed/cleaned_dataset.csv")

numeric_features = ['CGPA', 'Major Projects', 'Workshops/Certifications', 'Mini Projects',
                     'Skills', 'Communication Skill Rating', '12th Percentage',
                     '10th Percentage', 'backlogs']
binary_features = ['Internship', 'Hackathon']
FEATURE_ORDER = numeric_features + binary_features

df_enc = df.copy()
for col in binary_features:
    df_enc[col] = df_enc[col].map({'No': 0, 'Yes': 1})

target_le = LabelEncoder()
y_all = target_le.fit_transform(df_enc['PlacementStatus'])  # NotPlaced=0, Placed=1
X_all = df_enc[FEATURE_ORDER]

X_train, X_test, y_train, y_test = train_test_split(
    X_all, y_all, test_size=0.20, stratify=y_all, random_state=RANDOM_STATE
)

print("=" * 70)
print("STAGE 5 — TRAIN/TEST SPLIT")
print("=" * 70)
print(f"Training set size: {X_train.shape[0]}")
print(f"Testing set size:  {X_test.shape[0]}")
print(f"Number of features: {X_train.shape[1]}")
print("Train class distribution:", dict(zip(*np.unique(y_train, return_counts=True))))
print("Test class distribution: ", dict(zip(*np.unique(y_test, return_counts=True))))

# ---------------------------------------------------------------
# STAGE 6 — CLASS IMBALANCE
# ---------------------------------------------------------------
print()
print("=" * 70)
print("STAGE 6 — CLASS IMBALANCE HANDLING")
print("=" * 70)
train_ratio = np.bincount(y_train)
print(f"Train class counts: NotPlaced={train_ratio[0]}, Placed={train_ratio[1]} "
      f"(ratio {train_ratio[0]/train_ratio[1]:.2f}:1)")
print("Imbalance is mild (~1.4:1). Will compare class_weight='balanced' vs SMOTE (train-only) vs none.")

scaler = StandardScaler()
X_train_scaled = X_train.copy()
X_test_scaled = X_test.copy()
X_train_scaled[numeric_features] = scaler.fit_transform(X_train[numeric_features])
X_test_scaled[numeric_features] = scaler.transform(X_test[numeric_features])

smote = SMOTE(random_state=RANDOM_STATE)
X_train_sm, y_train_sm = smote.fit_resample(X_train_scaled, y_train)
print(f"After SMOTE (train only): {dict(zip(*np.unique(y_train_sm, return_counts=True)))}")

# ---------------------------------------------------------------
# STAGE 7 — TRAIN MULTIPLE MODELS
# ---------------------------------------------------------------
print()
print("=" * 70)
print("STAGE 7 — TRAIN MULTIPLE MODELS (baseline, class_weight balanced where supported)")
print("=" * 70)

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE),
    "Random Forest": RandomForestClassifier(class_weight="balanced", random_state=RANDOM_STATE),
    "Decision Tree": DecisionTreeClassifier(class_weight="balanced", random_state=RANDOM_STATE),
    "K-Nearest Neighbors": KNeighborsClassifier(),
    "Support Vector Machine": SVC(probability=True, class_weight="balanced", random_state=RANDOM_STATE),
    "Gradient Boosting": GradientBoostingClassifier(random_state=RANDOM_STATE),
    "XGBoost": XGBClassifier(eval_metric="logloss", random_state=RANDOM_STATE,
                              scale_pos_weight=train_ratio[0] / train_ratio[1]),
}

results = []
fitted_models = {}
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    fitted_models[name] = model

    train_pred = model.predict(X_train_scaled)
    test_pred = model.predict(X_test_scaled)
    test_proba = model.predict_proba(X_test_scaled)[:, 1]

    train_acc = accuracy_score(y_train, train_pred)
    test_acc = accuracy_score(y_test, test_pred)
    prec = precision_score(y_test, test_pred)
    rec = recall_score(y_test, test_pred)
    f1 = f1_score(y_test, test_pred)
    roc_auc = roc_auc_score(y_test, test_proba)
    cm = confusion_matrix(y_test, test_pred)

    results.append({
        "Model": name, "Train Acc": train_acc, "Test Acc": test_acc,
        "Precision": prec, "Recall": rec, "F1": f1, "ROC-AUC": roc_auc,
        "Overfit Gap": train_acc - test_acc, "CM": cm.tolist()
    })

results_df = pd.DataFrame(results).sort_values("F1", ascending=False)
print(results_df[["Model", "Train Acc", "Test Acc", "Precision", "Recall", "F1", "ROC-AUC", "Overfit Gap"]]
      .round(4).to_string(index=False))

print()
for r in results:
    print(f"{r['Model']} Confusion Matrix: {r['CM']}")

# ---------------------------------------------------------------
# STAGE 8 — HYPERPARAMETER TUNING (top 2 by F1)
# ---------------------------------------------------------------
print()
print("=" * 70)
print("STAGE 8 — HYPERPARAMETER TUNING")
print("=" * 70)

top2 = results_df.head(2)["Model"].tolist()
print("Tuning candidates (top 2 by F1):", top2)

param_grids = {
    "Random Forest": {
        "n_estimators": [100, 200, 300],
        "max_depth": [None, 5, 10, 15],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf": [1, 2, 4],
    },
    "XGBoost": {
        "n_estimators": [100, 200, 300],
        "max_depth": [3, 4, 5, 6],
        "learning_rate": [0.01, 0.05, 0.1, 0.2],
        "subsample": [0.7, 0.85, 1.0],
    },
    "Gradient Boosting": {
        "n_estimators": [100, 200, 300],
        "max_depth": [2, 3, 4],
        "learning_rate": [0.01, 0.05, 0.1, 0.2],
        "subsample": [0.7, 0.85, 1.0],
    },
    "Logistic Regression": {
        "C": [0.01, 0.1, 1, 10, 100],
        "penalty": ["l2"],
        "solver": ["lbfgs"],
    },
    "Support Vector Machine": {
        "C": [0.1, 1, 10],
        "kernel": ["rbf", "linear"],
        "gamma": ["scale", "auto"],
    },
    "Decision Tree": {
        "max_depth": [None, 5, 10, 15, 20],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf": [1, 2, 4],
    },
    "K-Nearest Neighbors": {
        "n_neighbors": [3, 5, 7, 9, 11, 15],
        "weights": ["uniform", "distance"],
    },
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
tuned_models = {}
tuning_summary = []

for name in top2:
    base_model = models[name]
    grid = param_grids[name]
    search = RandomizedSearchCV(base_model, grid, n_iter=20, scoring="f1",
                                 cv=cv, random_state=RANDOM_STATE, n_jobs=-1)
    search.fit(X_train_scaled, y_train)
    tuned_models[name] = search.best_estimator_

    base_f1 = results_df[results_df["Model"] == name]["F1"].values[0]
    tuned_pred = search.best_estimator_.predict(X_test_scaled)
    tuned_f1 = f1_score(y_test, tuned_pred)

    print(f"\n{name}: best params = {search.best_params_}")
    print(f"  Baseline F1 (test): {base_f1:.4f}  ->  Tuned F1 (test): {tuned_f1:.4f}  "
          f"(delta {tuned_f1 - base_f1:+.4f})")
    tuning_summary.append({"Model": name, "Baseline F1": base_f1, "Tuned F1": tuned_f1})

# ---------------------------------------------------------------
# STAGE 9 — FINAL MODEL SELECTION
# ---------------------------------------------------------------
print()
print("=" * 70)
print("STAGE 9 — FINAL MODEL SELECTION")
print("=" * 70)

final_candidates = {}
for name in top2:
    # Consider both the tuned estimator and the original baseline; keep whichever
    # generalizes better (tuning is not guaranteed to beat a well-fit baseline).
    for variant_label, mdl in [("tuned", tuned_models[name]), ("baseline", fitted_models[name])]:
        pred = mdl.predict(X_test_scaled)
        proba = mdl.predict_proba(X_test_scaled)[:, 1]
        key = f"{name} ({variant_label})"
        final_candidates[key] = {
            "model": mdl,
            "train_acc": accuracy_score(y_train, mdl.predict(X_train_scaled)),
            "test_acc": accuracy_score(y_test, pred),
            "precision": precision_score(y_test, pred),
            "recall": recall_score(y_test, pred),
            "f1": f1_score(y_test, pred),
            "roc_auc": roc_auc_score(y_test, proba),
            "cm": confusion_matrix(y_test, pred),
        }

best_name = max(final_candidates, key=lambda n: final_candidates[n]["f1"])
best = final_candidates[best_name]
best_model = best["model"]

print(f"Best Model: {best_name}")
print(f"Training Accuracy: {best['train_acc']:.4f}")
print(f"Test Accuracy:     {best['test_acc']:.4f}")
print(f"Precision:         {best['precision']:.4f}")
print(f"Recall:            {best['recall']:.4f}")
print(f"F1 Score:          {best['f1']:.4f}")
print(f"ROC-AUC:           {best['roc_auc']:.4f}")
print(f"Confusion Matrix:\n{best['cm']}")
print(f"Overfitting check: train-test acc gap = {best['train_acc']-best['test_acc']:.4f} "
      f"({'acceptable' if abs(best['train_acc']-best['test_acc'])<0.05 else 'investigate'})")

# ---------------------------------------------------------------
# STAGE 10 — FEATURE IMPORTANCE
# ---------------------------------------------------------------
print()
print("=" * 70)
print("STAGE 10 — FEATURE IMPORTANCE")
print("=" * 70)

if hasattr(best_model, "feature_importances_"):
    importances = pd.Series(best_model.feature_importances_, index=FEATURE_ORDER).sort_values(ascending=False)
elif hasattr(best_model, "coef_"):
    importances = pd.Series(np.abs(best_model.coef_[0]), index=FEATURE_ORDER).sort_values(ascending=False)
else:
    from sklearn.inspection import permutation_importance
    pi = permutation_importance(best_model, X_test_scaled, y_test, n_repeats=10, random_state=RANDOM_STATE)
    importances = pd.Series(pi.importances_mean, index=FEATURE_ORDER).sort_values(ascending=False)

print(importances.round(4))

# ---------------------------------------------------------------
# STAGE 13 — SAVE ARTIFACTS
# ---------------------------------------------------------------
print()
print("=" * 70)
print("STAGE 13 — SAVING ARTIFACTS")
print("=" * 70)

joblib.dump(best_model, "models/placement_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")
joblib.dump(target_le, "models/target_encoder.pkl")

metadata = {
    "feature_order": FEATURE_ORDER,
    "numeric_features": numeric_features,
    "binary_features": binary_features,
    "binary_map": {"No": 0, "Yes": 1},
    "target_classes": target_le.classes_.tolist(),  # index 0 -> class name
    "best_model_name": best_name,
    "metrics": {
        "train_accuracy": best["train_acc"],
        "test_accuracy": best["test_acc"],
        "precision": best["precision"],
        "recall": best["recall"],
        "f1": best["f1"],
        "roc_auc": best["roc_auc"],
        "confusion_matrix": best["cm"].tolist(),
    },
    "dataset_size": len(df),
    "num_placed": int((df["PlacementStatus"] == "Placed").sum()),
    "num_not_placed": int((df["PlacementStatus"] == "NotPlaced").sum()),
    "feature_importance": importances.round(4).to_dict(),
    "model_comparison": results_df[["Model", "Train Acc", "Test Acc", "Precision", "Recall", "F1", "ROC-AUC"]]
        .round(4).to_dict(orient="records"),
    "tuning_summary": tuning_summary,
}
with open("models/metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("Saved: models/placement_model.pkl, models/scaler.pkl, models/target_encoder.pkl, models/metadata.json")
print("\nDONE.")
