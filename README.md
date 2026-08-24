# Student Placement Prediction

Predicts whether a student will be **Placed** or **Not Placed** based on academic and activity features, with a placement probability score.

## Project Structure

```
placement final/
├── data/
│   ├── raw/Placement_Prediction_data.csv     # original dataset (10000 rows x 14 cols)
│   └── processed/cleaned_dataset.csv         # cleaned dataset (ID columns dropped)
├── models/
│   ├── placement_model.pkl                   # trained Gradient Boosting classifier
│   ├── scaler.pkl                             # StandardScaler for numeric features
│   ├── target_encoder.pkl                     # LabelEncoder for PlacementStatus
│   └── metadata.json                          # feature order, metrics, importances
├── notebooks/                                 # EDA plots (PNG)
├── static/style.css, script.js
├── templates/index.html
├── train.py        # Stages 5-10, 13: split, model training, tuning, selection, saving
├── predict.py       # Stage 11: prediction system (validation + predict_proba)
├── app.py            # Stage 12: Flask web application
├── requirements.txt
└── README.md
```

## Setup & Run

```bash
pip install -r requirements.txt

# (Optional) Re-run training pipeline from scratch:
python train.py

# Start the web app:
python app.py
```

Then open http://127.0.0.1:5000 in your browser, fill in the student details, and click **Predict Placement**.

## Final Model

- **Model**: Gradient Boosting Classifier (baseline, untuned — outperformed tuned variants)
- **Test Accuracy**: 94.65%
- **Precision**: 93.47% | **Recall**: 93.80% | **F1**: 93.63%
- **ROC-AUC**: 99.05%
- **Overfitting gap** (train-test accuracy): 0.0008 — negligible

## Final Input Features (11)

CGPA, Major Projects, Workshops/Certifications, Mini Projects, Skills, Communication Skill Rating, 12th Percentage, 10th Percentage, backlogs, Internship (Yes/No), Hackathon (Yes/No)

## Most Important Feature

`backlogs` (82% importance) — students with fewer backlogs and higher CGPA show substantially higher placement probability in this dataset.
