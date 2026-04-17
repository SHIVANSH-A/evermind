import joblib
import numpy as np
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")


model = joblib.load(os.path.join(MODEL_DIR, "stack_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
anomaly_model = joblib.load(os.path.join(MODEL_DIR, "anomaly.pkl"))
target_encoder = joblib.load(os.path.join(MODEL_DIR, "target_encoder.pkl"))


def compute_history(history):
    scores = {}

    for h in history:
        action = h["intervention"]
        success = h["success"]

        if action not in scores:
            scores[action] = {"success": 0, "total": 0}

        scores[action]["success"] += success
        scores[action]["total"] += 1

    return {k: v["success"] / v["total"] for k, v in scores.items()}



def recommend(hr, bp, temp, state, history):

    
    input_df = pd.DataFrame([{
        "heart_rate": hr,
        "blood_pressure": bp,
        "temperature": temp,
        "state": state,
        "hr_bp_ratio": hr / (bp + 1),
        "temp_flag": 1 if temp > 99 else 0,
        "hr_squared": hr ** 2,
        "bp_temp_interaction": bp * temp
    }])

    
    input_scaled = scaler.transform(input_df)

    
    anomaly = anomaly_model.predict(input_scaled)[0]

    
    probs = model.predict_proba(input_scaled)[0]
    classes = model.classes_

    
    history_scores = compute_history(history)

    final_scores = {}

    for i, action in enumerate(classes):

        model_score = probs[i]

        # Convert numeric class → label
        label = target_encoder.inverse_transform([action])[0]

        history_score = history_scores.get(label, 0.5)

        anomaly_boost = 0.1 if anomaly == -1 else 0

        final = 0.7 * model_score + 0.2 * history_score + anomaly_boost

        # Store as STRING key (fix JSON issue)
        final_scores[label] = float(final)

    # Best action
    best_label = max(final_scores, key=final_scores.get)

    # Explanation
    explanation = "Based on vital signs, ML model prediction, and past intervention success."

    if anomaly == -1:
        explanation += " Abnormal condition detected."

    return best_label, final_scores, explanation