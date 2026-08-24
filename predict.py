"""Stage 11 — Prediction system. Loads saved artifacts and predicts on new input."""
import json
import joblib
import pandas as pd

MODEL = joblib.load("models/placement_model.pkl")
SCALER = joblib.load("models/scaler.pkl")
TARGET_ENCODER = joblib.load("models/target_encoder.pkl")
with open("models/metadata.json") as f:
    META = json.load(f)

FEATURE_ORDER = META["feature_order"]
NUMERIC_FEATURES = META["numeric_features"]
BINARY_FEATURES = META["binary_features"]
BINARY_MAP = META["binary_map"]


def validate_input(data: dict):
    errors = []
    for col in FEATURE_ORDER:
        if col not in data or data[col] in (None, ""):
            errors.append(f"Missing value for '{col}'")
    if errors:
        raise ValueError("; ".join(errors))

    for col in BINARY_FEATURES:
        if str(data[col]) not in BINARY_MAP:
            errors.append(f"'{col}' must be one of {list(BINARY_MAP.keys())}")

    ranges = {
        "CGPA": (0, 10), "Major Projects": (0, 20), "Workshops/Certifications": (0, 20),
        "Mini Projects": (0, 20), "Skills": (0, 20), "Communication Skill Rating": (0, 5),
        "12th Percentage": (0, 100), "10th Percentage": (0, 100), "backlogs": (0, 20),
    }
    for col, (lo, hi) in ranges.items():
        try:
            v = float(data[col])
            if not (lo <= v <= hi):
                errors.append(f"'{col}' should be between {lo} and {hi}")
        except (TypeError, ValueError):
            errors.append(f"'{col}' must be numeric")

    if errors:
        raise ValueError("; ".join(errors))


def predict_placement(data: dict) -> dict:
    """data: dict with keys matching FEATURE_ORDER (raw values, Yes/No for binary features)."""
    validate_input(data)

    row = {}
    for col in NUMERIC_FEATURES:
        row[col] = float(data[col])
    for col in BINARY_FEATURES:
        row[col] = BINARY_MAP[str(data[col])]

    X = pd.DataFrame([row])[FEATURE_ORDER]
    X[NUMERIC_FEATURES] = SCALER.transform(X[NUMERIC_FEATURES])

    proba = MODEL.predict_proba(X)[0]  # [P(NotPlaced), P(Placed)]
    pred_idx = int(proba[1] >= 0.5)
    pred_label = TARGET_ENCODER.classes_[pred_idx]

    placed_prob = float(proba[1]) * 100
    not_placed_prob = float(proba[0]) * 100

    confidence = "High" if max(proba) >= 0.85 else ("Medium" if max(proba) >= 0.65 else "Low")

    return {
        "prediction": "PLACED" if pred_label == "Placed" else "NOT PLACED",
        "placement_probability": round(placed_prob, 2),
        "not_placed_probability": round(not_placed_prob, 2),
        "confidence": confidence,
    }


if __name__ == "__main__":
    example = {
        "CGPA": 8.5, "Major Projects": 2, "Workshops/Certifications": 3, "Mini Projects": 2,
        "Skills": 8, "Communication Skill Rating": 4.6, "12th Percentage": 82,
        "10th Percentage": 85, "backlogs": 0, "Internship": "Yes", "Hackathon": "Yes",
    }
    result = predict_placement(example)
    print("Input:", example)
    print("Result:", result)

    example2 = {
        "CGPA": 6.7, "Major Projects": 0, "Workshops/Certifications": 1, "Mini Projects": 0,
        "Skills": 6, "Communication Skill Rating": 3.5, "12th Percentage": 58,
        "10th Percentage": 65, "backlogs": 5, "Internship": "No", "Hackathon": "No",
    }
    result2 = predict_placement(example2)
    print()
    print("Input:", example2)
    print("Result:", result2)
