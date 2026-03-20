import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MemoryAssisstant() {
  const [patient, setPatient] = useState(null);
  const [relatives, setRelatives] = useState([]); // New state for relatives
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/caregiver/login");
      return;
    }

    async function fetchData() {
      try {
        // Fetch patient data
        const patientRes = await axios.get("http://localhost:5000/patient", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedPatient = patientRes.data.patients[0] || null;
        setPatient(fetchedPatient);

        // Fetch relatives data
        const relativesRes = await axios.get("http://localhost:5000/relatives", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRelatives(relativesRes.data.relatives);

      } catch (err) {
        console.error("Error fetching data:", err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/caregiver/login");
        } else {
          setError("Failed to fetch data. Try again later.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  const handleAddRelative = () => {
    navigate("/relatives/add");
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-6">{error}</p>;
  if (!patient) return <p className="text-center text-gray-500 mt-6">No patient found.</p>;

  return (
    <div className="bg-gray-100 p-6 flex flex-col items-center">
      {/* Patient Card */}
      <div className="bg-white p-6 rounded-xl shadow-md w-80 text-center mb-6">
        {patient.faceImageUrl && (
          <img
            src={patient.faceImageUrl}
            alt={`${patient.full_name}'s face`}
            className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
          />
        )}
        <h2 className="text-xl font-bold">{patient.full_name}</h2>
        <p className="text-gray-600 mb-4">Age: {patient.age}</p>
        <button
          onClick={handleAddRelative}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Relative
        </button>
      </div>

      <hr className="w-full max-w-lg mb-6 border-t-2 border-gray-300" />

      {/* Relatives List */}
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Registered Relatives</h2>
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
                <p className="text-sm text-gray-600">Message: {relative.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}