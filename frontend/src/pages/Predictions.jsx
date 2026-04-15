import { useState } from "react";
import axios from "axios";

export default function Predictions() {
  const [hr, setHr] = useState("");
  const [bp, setBp] = useState("");
  const [temp, setTemp] = useState("");
  const [state, setState] = useState("");
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState(null);

  const patient_id = "0697d"; // later dynamic kar sakte ho

  const getRecommendation = async () => {
    const stateMap = {
      agitation: 1,
      confusion: 0
    };

    await axios.post("http://localhost:5000/vitals", {
      patient_id,
      heart_rate: Number(hr),
      blood_pressure: Number(bp),
      temperature: Number(temp),
      state
    });

    const res = await axios.post("http://localhost:5000/recommend", {
      heart_rate: Number(hr),
      bp: Number(bp),
      temp: Number(temp),
      state: stateMap[state],
      patient_id
    });

    setResult(res.data.recommended);
    setScores(res.data.scores);
  };

  const sendFeedback = async (success) => {
    await axios.post("http://localhost:5000/history", {
      patient_id,
      intervention: result,
      success
    });

    alert("Feedback saved! System is learning 👀");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-6">
          AI Intervention Recommendation
        </h1>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            className="p-2 border rounded"
            placeholder="Heart Rate"
            onChange={(e) => setHr(e.target.value)}
          />

          <input
            className="p-2 border rounded"
            placeholder="Blood Pressure"
            onChange={(e) => setBp(e.target.value)}
          />

          <input
            className="p-2 border rounded"
            placeholder="Temperature"
            onChange={(e) => setTemp(e.target.value)}
          />

          <select
            className="p-2 border rounded"
            onChange={(e) => setState(e.target.value)}
          >
            <option>Select State</option>
            <option value="agitation">Agitation</option>
            <option value="confusion">Confusion</option>
          </select>

        </div>

        {/* Button */}
        <button
          onClick={getRecommendation}
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Analyze & Suggest Action
        </button>

        {/* Result */}
        {result && (
          <div className="mt-8">

            <h2 className="text-xl font-semibold">
              Recommended Action:
            </h2>

            <p className="text-2xl font-bold text-blue-600 mt-2">
              {result}
            </p>

            {/* Scores */}
            {scores && (
              <div className="mt-4">
                <h3 className="font-semibold">Confidence Scores:</h3>
                {Object.entries(scores).map(([key, value]) => (
                  <p key={key}>
                    {key}: {(value * 100).toFixed(1)}%
                  </p>
                ))}
              </div>
            )}

            {/* Feedback */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => sendFeedback(1)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Effective ✅
              </button>

              <button
                onClick={() => sendFeedback(0)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Not Effective ❌
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}