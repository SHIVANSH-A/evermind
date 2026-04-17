import joblib
import numpy as np
import os

# Load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "DecisionTree.pkl")
model = joblib.load(model_path)


def compute_history(history):
    scores = {}

    for h in history:
        action = h["intervention"]
        success = h["success"]

        if action not in scores:
            scores[action] = {"success": 0, "total": 0}

        scores[action]["success"] += success
        scores[action]["total"] += 1

    final = {}
    for k in scores:
        final[k] = scores[k]["success"] / scores[k]["total"]

    return final


def get_concern_level(hr, bp, temp):

    score = 0

    # Heart Rate
    if hr > 120 or hr < 55:
        score += 2
    elif hr > 100 or hr < 65:
        score += 1

    # Blood Pressure
    if bp > 160 or bp < 90:
        score += 2
    elif bp > 140 or bp < 100:
        score += 1

    # Temperature
    if temp > 102 or temp < 96:
        score += 2
    elif temp > 100 or temp < 97:
        score += 1

    if score >= 5:
        return "High 🔴"
    elif score >= 3:
        return "Moderate 🟡"
    else:
        return "Low 🟢"



def recommend(hr, bp, temp, state, history):

    input_data = np.array([[hr, bp, temp, state]])

    probs = model.predict_proba(input_data)[0]
    classes = model.classes_

    history_scores = compute_history(history)

    final_scores = {}

    for i, action in enumerate(classes):

        model_score = probs[i]
        history_score = history_scores.get(action, 0.5)

        final = 0.6 * model_score + 0.4 * history_score

        final_scores[str(action)] = float(final)

    best = max(final_scores, key=final_scores.get)

    concern = get_concern_level(hr, bp, temp)

    return best, final_scores, concern