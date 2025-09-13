import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CaregiverRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Caregiver Registered:", form);
    navigate("/caregiver/login");
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Caregiver Register</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 border rounded-lg"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-lg"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Register
        </button>
      </form>
    </div>
  );
}
