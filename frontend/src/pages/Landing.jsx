import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-r from-pink-200 to-purple-300 text-white">
      <div className="flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-2xl p-10 shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-bold mb-10 text-center text-black">
          Welcome to NeuroBuddy
        </h1>
        <div className="space-y-6 w-full">
          <button
            onClick={() => navigate("/caregiver/login")}
            className="w-full px-6 py-3 bg-white text-black rounded-xl font-semibold shadow-lg hover:bg-gray-100"
          >
            I am a Caregiver
          </button>
          <button
            onClick={() => navigate("/patient/login")}
            className="w-full px-6 py-3 bg-white text-black rounded-xl font-semibold shadow-lg hover:bg-gray-100"
          >
            I am a Patient
          </button>
        </div>
      </div>
    </div>
  );
}
