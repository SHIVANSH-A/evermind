import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CaregiverDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/caregiver/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/caregiver/login");
  };

  const modules = [
    {
      title: "Patient Profile",
      desc: "View and manage patient information",
      path: "/caregiver/patient",
      icon: "👤",
    },
    {
      title: "Memory Assistant",
      desc: "Add and manage relatives",
      path: "/caregiver/relatives",
      icon: "🧠",
    },
    {
      title: "Health Monitoring",
      desc: "Track BP, heart rate and medication",
      path: "/caregiver/health",
      icon: "❤️",
    },
    {
      title: "Mood Tracking",
      desc: "Track patient emotions",
      path: "/caregiver/mood",
      icon: "😊",
    },
    {
      title: "Behavior Logs",
      desc: "Record daily patient behaviour",
      path: "/caregiver/behavior-logs",
      icon: "📋",
    },
    {
      title: "Analytics",
      desc: "View sleep, mood and agitation trends",
      path: "/caregiver/analytics",
      icon: "📊",
    },
    {
      title: "Routine Manager",
      desc: "Manage daily reminders for patient",
      path: "/caregiver/routine",
      icon: "⏰",
    },
    {
      title: "Smart Recommendations",
      desc: "AI-powered personalized intervention suggestions",
      path: "/caregiver/predictions",
      icon: "🤖",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">Caregiver Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Patient</h3>
          <p className="text-xl font-semibold">Active</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Last Mood</h3>
          <p className="text-xl font-semibold">Happy 😊</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Heart Rate</h3>
          <p className="text-xl font-semibold">78 bpm</p>
        </div>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {modules.map((module, index) => (
          <div
            key={index}
            onClick={() => navigate(module.path)}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl cursor-pointer transition transform hover:scale-105"
          >
            <div className="text-3xl mb-3">{module.icon}</div>

            <h2 className="text-xl font-semibold">{module.title}</h2>

            <p className="text-gray-600 mt-2">{module.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}