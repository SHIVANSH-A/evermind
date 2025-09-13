// PatientDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [relatives, setRelatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Load patient and relative data
  useEffect(() => {
    async function fetchData() {
      try {
        const patientRes = await axios.get("http://localhost:5000/patients");
        const fetchedPatient = patientRes.data.patients[0] || null;
        setPatient(fetchedPatient);

        if (!fetchedPatient) {
          setError("No patient data found.");
          setLoading(false);
          return;
        }

        const relativesRes = await axios.get("http://localhost:5000/relatives");
        setRelatives(relativesRes.data.relatives);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

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

  const handleIdentify = async () => {
    if (!modelsLoaded || isScanning || relatives.length === 0) {
      if (!modelsLoaded) setMatchResult({ error: "Models are still loading..." });
      if (relatives.length === 0) setMatchResult({ error: "No relatives to identify." });
      return;
    }
    setIsScanning(true);
    setMatchResult(null);

    try {
      // 1. Capture image from webcam and generate embedding
      const imageSrc = webcamRef.current.getScreenshot();
      const img = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMatchResult({ error: "No face detected. Please try again." });
        setIsScanning(false);
        return;
      }

      const embedding = detection.descriptor;

      // 2. Compare with all stored relative embeddings
      const THRESHOLD = 0.6;
      let matchedRelative = null;

      for (const relative of relatives) {
        if (relative.face_embedding) {
          const storedEmbedding = new Float32Array(relative.face_embedding);
          const distance = faceapi.euclideanDistance(embedding, storedEmbedding);
          if (distance < THRESHOLD) {
            matchedRelative = relative;
            break;
          }
        }
      }

      setMatchResult({ relative: matchedRelative });
    } catch (err) {
      console.error("Error during identification:", err);
      setMatchResult({ error: "Failed to identify relative." });
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenWebcam = () => {
    setIsWebcamActive(true);
    setMatchResult(null);
  };
  
  const handleCloseWebcam = () => {
    setIsWebcamActive(false);
    setMatchResult(null);
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-6">{error}</p>;
  if (!patient) {
    navigate("/patient/login");
    return null;
  }

  return (
    <div className="bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Welcome, {patient.full_name}!</h1>
      
      {/* Patient's own card */}
      <div className="p-4 bg-white rounded shadow w-full max-w-sm text-center mb-6">
        <p className="text-lg"><strong>Name:</strong> {patient.full_name}</p>
        <p className="text-lg"><strong>Age:</strong> {patient.age}</p>
      </div>

      <hr className="w-full max-w-lg mb-6 border-t-2 border-gray-300" />
      
      {/* Identify Relatives Section */}
      <div className="w-full max-w-lg mb-6">
        <h2 className="text-2xl font-bold text-center mb-4">Identify Your Family</h2>
        
        {isWebcamActive && (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={640}
            height={480}
            className="rounded-lg shadow-md mb-4"
          />
        )}
        
        <div className="flex gap-4">
          {!isWebcamActive && (
            <button
              onClick={handleOpenWebcam}
              className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 disabled:bg-gray-400 flex-1"
              disabled={!modelsLoaded}
            >
              Start Webcam
            </button>
          )}

          {isWebcamActive && (
            <>
              <button
                onClick={handleIdentify}
                className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400 flex-1"
                disabled={isScanning || relatives.length === 0}
              >
                {isScanning ? "Scanning..." : "Capture & Identify"}
              </button>
              <button
                onClick={handleCloseWebcam}
                className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 flex-1"
              >
                Close Webcam
              </button>
            </>
          )}
        </div>

        {matchResult && (
          <div className="mt-4 p-4 rounded shadow bg-white">
            {matchResult.error ? (
              <p className="text-red-500">{matchResult.error}</p>
            ) : matchResult.relative ? (
              <div>
                <h3 className="text-lg font-semibold text-green-600">Match Found!</h3>
                <div className="mt-2 text-center">
                  <img
                    src={matchResult.relative.image_url}
                    alt={`${matchResult.relative.name}'s face`}
                    className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
                  />
                  <p className="text-lg font-bold">{matchResult.relative.name}</p>
                  <p className="text-sm text-gray-600">"{matchResult.relative.message}"</p>
                </div>
              </div>
            ) : (
              <p className="text-red-500">No match found. Please try again or with a different relative.</p>
            )}
          </div>
        )}
      </div>

      <hr className="w-full max-w-lg mb-6 border-t-2 border-gray-300" />
      
      {/* Relatives List */}
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Your Relatives</h2>
        {relatives.length === 0 ? (
          <p className="text-center text-gray-500">No relatives registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatives.map((relative) => (
              <div
                key={relative.id}
                className="bg-white p-4 rounded-xl shadow-md border border-gray-200 text-center"
              >
                {relative.image_url && (
                  <img
                    src={relative.image_url}
                    alt={`${relative.name}'s face`}
                    className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
                  />
                )}
                <h3 className="text-lg font-semibold">{relative.name}</h3>
                <p className="text-sm text-gray-600">"{relative.message}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}