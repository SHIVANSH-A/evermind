import pandas as pd
import time
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# Load dataset
data = pd.read_csv("final_dataset.csv")

# ✅ Encode STATE FIRST
le = LabelEncoder()
data["state"] = le.fit_transform(data["state"])

# Features & Target
X = data[["heart_rate","blood_pressure","temperature","state"]]
y = data["intervention"]

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Models
models = {
    "RandomForest": RandomForestClassifier(),
    "DecisionTree": DecisionTreeClassifier(),
    "LogisticRegression": LogisticRegression(max_iter=200)
}

results = {}

for name, model in models.items():

    start = time.time()

    model.fit(X_train, y_train)

    end = time.time()

    preds = model.predict(X_test)

    accuracy = accuracy_score(y_test, preds)
    training_time = end - start   # ✅ correct name

    throughput = len(X_train) / training_time

    results[name] = {
        "accuracy": accuracy,
        "training_time": training_time,
        "throughput": throughput
    }

    joblib.dump(model, f"{name}.pkl")

print("RESULTS:\n", results)

# 📊 Graphs
names = list(results.keys())

accuracy_vals = [results[m]["accuracy"] for m in names]
time_vals = [results[m]["training_time"] for m in names]
throughput_vals = [results[m]["throughput"] for m in names]

# Accuracy graph
plt.figure()
plt.bar(names, accuracy_vals)
plt.title("Accuracy Comparison")
plt.savefig("accuracy.png")

# Training time graph
plt.figure()
plt.bar(names, time_vals)
plt.title("Training Time Comparison")
plt.savefig("training_time.png")

# Throughput graph
plt.figure()
plt.bar(names, throughput_vals)
plt.title("Throughput Comparison")
plt.savefig("throughput.png")