# PlacementAI — Student Placement Prediction Platform

AI-powered career intelligence for students: predicts placement probability from academic and activity data, then wraps that model in a full product — dashboard, analytics, resume tools, interview prep, and a company/skill recommendation engine.

The prediction is real. A Gradient Boosting classifier trained on 10,000 student records drives every probability shown in the app. The surrounding product features (analytics, recommendations, leaderboard) are served by a FastAPI layer with in-memory data, ready to be backed by a real database.

## Live features

- **Landing page** — marketing site introducing the product
- **Auth** — email/password signup & login, Google OAuth, GitHub account linking
- **Dashboard** — placement readiness snapshot at a glance
- **Prediction** — run the real trained model against your profile; see the probability, driver breakdown, and an interactive **What-If Simulator** to explore how changes to CGPA, projects, skills, backlogs, etc. move the odds
- **Analytics** — trends and breakdowns over your profile history
- **Recommendations** — company matches and skill-gap guidance
- **Resume, Interview Prep, Leaderboard, Profile, Settings**

## Architecture

```
placement final/
├── backend/                 # FastAPI application (the real API layer)
│   ├── main.py               # app entrypoint, CORS, startup hooks
│   ├── config.py              # env-driven settings (Pydantic)
│   ├── app/
│   │   ├── api/router.py       # aggregates all domain routers
│   │   ├── routes/              # auth, prediction, dashboard, analytics,
│   │   │                        # recommendations, resume, profile, settings,
│   │   │                        # onboarding, integrations
│   │   ├── services/             # business logic (incl. prediction_service,
│   │   │                        #  which loads the trained model)
│   │   ├── auth/                  # JWT + Google/GitHub OAuth
│   │   ├── models/                 # in-memory data store
│   │   └── schemas/                 # Pydantic request/response models
│   └── requirements.txt
│
├── frontend/                # React + TypeScript + Vite SPA
│   └── src/
│       ├── pages/            # landing, auth, and /app/* pages
│       ├── layouts/           # MarketingLayout, AppShell
│       ├── components/         # UI primitives, nav, motion/3D
│       ├── stores/              # Zustand (auth, theme, UI)
│       └── lib/                  # Axios API client, React Query setup
│
├── data/
│   ├── raw/Placement_Prediction_data.csv     # original dataset (10,000 rows x 14 cols)
│   └── processed/cleaned_dataset.csv          # cleaned dataset (ID columns dropped)
├── models/
│   ├── placement_model.pkl                    # trained Gradient Boosting classifier
│   ├── scaler.pkl                              # StandardScaler for numeric features
│   ├── target_encoder.pkl                      # LabelEncoder for PlacementStatus
│   └── metadata.json                           # feature order, metrics, importances
├── notebooks/                                  # EDA plots (PNG)
├── train.py                                    # model training, tuning, selection, saving
├── predict.py                                  # standalone prediction helper (validation + predict_proba)
├── app.py                                      # legacy Flask demo (single-page form, no auth/API)
└── requirements.txt                            # root Python deps (training + Flask demo)
```

**Two ways to run the prediction model:**

1. **Full platform** (recommended) — FastAPI backend + React frontend. The backend loads the same `models/*.pkl` artifacts and exposes them over `POST /prediction`, alongside auth, dashboard, analytics, and recommendation endpoints.
2. **Legacy standalone demo** — `app.py`, a minimal Flask app with a single HTML form (`templates/index.html`) that calls `predict.py` directly. No auth, no extra product features — useful for a quick sanity check of the model alone.

## Getting started (full platform)

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

copy .env.example .env         # Windows — cp on macOS/Linux
# fill in OAuth credentials if you want Google/GitHub login; everything
# else works with the defaults

uvicorn main:app --reload --port 8000
```

API docs available at `http://127.0.0.1:8000/docs` once running.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install

copy .env.example .env         # Windows — cp on macOS/Linux
# VITE_API_BASE_URL should point at the backend (default http://127.0.0.1:8000)

npm run dev
```

Open `http://localhost:5173`.

> **Port matters:** OAuth redirect URIs and backend CORS are configured for `http://localhost:5173`. Running the frontend on a different port will break login until you update `CORS_ORIGINS` in `backend/.env` to match.

**Demo login:** `demo@example.com` / `password123` (seeded automatically on backend startup, with a demo prediction already in its history).

### 3. (Optional) Retrain the model

```bash
pip install -r requirements.txt   # root requirements — training deps
python train.py
```

Regenerates the artifacts in `models/`.

## Legacy standalone demo

```bash
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000`, fill in the form, and click **Predict Placement**.

## The model

- **Algorithm**: Gradient Boosting Classifier (baseline, untuned — outperformed tuned variants)
- **Dataset**: 10,000 students, 4,197 placed / 5,803 not placed
- **Test Accuracy**: 94.65%
- **Precision**: 93.47% · **Recall**: 93.80% · **F1**: 93.63%
- **ROC-AUC**: 99.05%
- **Overfitting gap** (train − test accuracy): 0.0008 — negligible

### Input features (11)

CGPA, Major Projects, Workshops/Certifications, Mini Projects, Skills, Communication Skill Rating, 12th Percentage, 10th Percentage, Backlogs, Internship (Yes/No), Hackathon (Yes/No)

### Most important feature

`backlogs` — by far the strongest predictor; students with fewer backlogs and higher CGPA show substantially higher placement probability in this dataset.

## Tech stack

| Layer | Stack |
|---|---|
| ML | scikit-learn, pandas, numpy, imbalanced-learn, joblib |
| Backend API | FastAPI, Pydantic, python-jose (JWT), Google/GitHub OAuth |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, React Hook Form + Zod |
| Motion/3D | Framer Motion, GSAP, React Three Fiber |
| Charts | Recharts |

## Notes

- The backend's analytics and recommendations endpoints currently return data backed by an in-memory store — it resets on every server restart. Swap in a real database before deploying.
- Google/GitHub OAuth are optional: without credentials in `backend/.env`, every other endpoint works normally and only the OAuth-specific routes return `503`.
