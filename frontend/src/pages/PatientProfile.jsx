import { useEffect, useState } from "react";
import axios from "axios";

export default function PatientProfile() {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    fetchPatient();
  }, []);

  const fetchPatient = async () => {
    try {
      const res = await axios.get("http://localhost:5000/patient");
      setPatient(res.data.patients[0]); 
    } catch (err) {
      console.error(err);
    }
  };

  if (!patient) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <div className="bg-white p-8 rounded-xl shadow max-w-xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">Patient Profile</h1>

        <p><b>Name:</b> {patient.full_name}</p>
        <p><b>Age:</b> {patient.age}</p>
        <p><b>Patient ID:</b> {patient.id}</p>

      </div>

    </div>
  );
}