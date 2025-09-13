// AddRelative.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddRelative() {
  const [formData, setFormData] = useState({ name: "", message: "", image: null, faceEmbedding: "" });
  const [status, setStatus] = useState("Ready to add relative.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !formData.image || !formData.faceEmbedding) return;

    setIsSubmitting(true);
    setStatus("Submitting form...");

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("message", formData.message);
      form.append("image", formData.image);
      form.append("faceEmbedding", formData.faceEmbedding);

      const res = await axios.post("http://localhost:5000/relatives/add", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setStatus("Relative added successfully!");
      console.log("Relative added:", res.data);
      navigate("/caregiver/dashboard");
    } catch (err) {
      console.error("Failed to add relative:", err);
      setStatus(`Failed to add relative: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Add Relative</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Relative's Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
            Relative's Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="faceEmbedding">
            Face Embedding (JSON array)
          </label>
          <textarea
            id="faceEmbedding"
            name="faceEmbedding"
            value={formData.faceEmbedding}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex flex-col items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Adding..." : "Submit"}
          </button>
          <p className="mt-4 text-sm text-center text-gray-600">{status}</p>
        </div>
      </form>
    </div>
  );
}