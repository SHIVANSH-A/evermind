import sys
import json
from predict import recommend

hr = float(sys.argv[1])
bp = float(sys.argv[2])
temp = float(sys.argv[3])
state = int(sys.argv[4])
history = json.loads(sys.argv[5])

result, scores = recommend(hr, bp, temp, state, history)

print(json.dumps({
    "recommended": result,
    "scores": scores
}))