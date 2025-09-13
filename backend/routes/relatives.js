// routes/relatives.js
import express from "express";
import { supabase } from "../supabaseClient.js";
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer'; // Import multer

const router = express.Router();
const upload = multer(); // Initialize multer

router.post("/add", upload.single('image'), async (req, res) => {
  try {
    const { name, message, faceEmbedding } = req.body;
    const imageFile = req.file;

    if (!name || !message || !imageFile || !faceEmbedding) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Since we're only using one patient, fetch the first patient's ID
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .single();

    if (patientError) {
      console.error("Error fetching patient ID:", patientError.message);
      return res.status(500).json({ error: "Patient ID not found." });
    }

    const patientId = patientData.id;

    // 1. Upload image to the Supabase Storage bucket
    const fileName = `${uuidv4()}.jpeg`;
    const filePath = `relative_faces/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evermind") // Use the bucket name you just created
      .upload(filePath, imageFile.buffer, {
        contentType: imageFile.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get the public URL for the uploaded image
    const publicURL = supabase.storage
      .from("evermind")
      .getPublicUrl(uploadData.path).data.publicUrl;

    // 2. Parse the face embedding string into a JSON object
    const parsedEmbedding = JSON.parse(faceEmbedding);

    // 3. Insert relative data into the database
    const { data, error: insertError } = await supabase
      .from("relatives")
      .insert([
        {
          name,
          message,
          face_embedding: parsedEmbedding,
          image_url: publicURL, // Store the public URL
          patient_id: patientId,
        },
      ])
      .select();

    if (insertError) throw insertError;

    res.status(201).json({ success: true, relative: data[0] });

  } catch (err) {
    console.error("Error adding relative:", err);
    res.status(500).json({ error: "Failed to add relative." });
  }
});

// Route to fetch all relatives for the single patient
router.get("/", async (req, res) => {
  try {
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .single();

    if (patientError) {
      console.error("Error fetching patient ID:", patientError.message);
      return res.status(500).json({ error: "Patient ID not found." });
    }

    const { data: relatives, error } = await supabase
      .from("relatives")
      .select("*")
      .eq("patient_id", patientData.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ relatives });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;