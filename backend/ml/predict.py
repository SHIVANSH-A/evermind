import joblib
import numpy as np
import os

# ✅ Load your BEST model (Decision Tree)
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


def recommend(hr, bp, temp, state, history):

    input_data = np.array([[hr, bp, temp, state]])

    probs = model.predict_proba(input_data)[0]
    classes = model.classes_

    history_scores = compute_history(history)

    final_scores = {}

    for i, action in enumerate(classes):

        model_score = probs[i]
        history_score = history_scores.get(action, 0.5)

        final = 0.5 * model_score + 0.5 * history_score

        final_scores[action] = final

    best = max(final_scores, key=final_scores.get)

    return best, final_scores