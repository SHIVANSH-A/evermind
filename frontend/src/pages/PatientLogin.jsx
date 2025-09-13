// PatientLogin.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function PatientLogin() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Load face-api.js models
  useEffect(() => {
    async function loadModels() {
      const MODEL_URL = '/models'; // relative to public folder
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    }
    loadModels();
  }, []);

  const handleScan = async () => {
    if (!modelsLoaded) return alert("Models are still loading...");
    setScanning(true);
    setMatchResult(null);

    try {
      // 1) Capture image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      const img = await faceapi.fetchImage(imageSrc);

      // 2) Detect face & compute embedding
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMatchResult({ error: "No face detected. Try again." });
        setScanning(false);
        return;
      }

      const embedding = Array.from(detection.descriptor); // Convert Float32Array → regular array

      // 3) Send embedding to backend for matching
      const res = await axios.post("http://localhost:5000/patients/match", {
        faceEmbedding: embedding,
      });
      const matchedPatient = res.data.patient;

      if (matchedPatient) {
        // Navigate to patient dashboard with optional state
        navigate("/patient/dashboard", { state: { patient: matchedPatient } });
      } else {
        setMatchResult({ patient: null });
      }
    } catch (err) {
      console.error(err);
      setMatchResult({ error: err.response?.data?.error || err.message });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patient Face Login</h1>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
        className="mb-4"
      />
      <button
        onClick={handleScan}
        disabled={scanning}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {scanning ? "Scanning..." : "Scan Face"}
      </button>

      <div className="mt-4">
        {matchResult?.error && <p className="text-red-500">{matchResult.error}</p>}
        {matchResult?.patient && (
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold">{matchResult.patient.full_name}</h2>
            <p>Age: {matchResult.patient.age}</p>
          </div>
        )}
        {matchResult?.patient === null && !matchResult?.error && (
          <p className="text-gray-600">No match found. Ask caregiver to register your photo.</p>
        )}
      </div>
    </div>
  );
}
