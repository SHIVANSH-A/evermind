// routes/patient.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Euclidean distance
function euclideanDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}
router.get("/", async(req,res) => {
  const {data,error} = await supabase
    .from("patients")
    .select("*");

  if(error) return res.status(500).json({error: error.message});
  res.json({ patients: data }); // Change this line
});
// POST /patient/match
router.post("/match", async (req, res) => {
  try {
    const { faceEmbedding } = req.body;
    if (!faceEmbedding) return res.status(400).json({ error: "faceEmbedding required" });

    // Fetch the single patient
    const { data: patients, error } = await supabase
      .from("patients")
      .select("*")
      .limit(1); // only fetch one for testing

    if (error) return res.status(500).json({ error: error.message });
    if (!patients || patients.length === 0) return res.json({ patient: null });

    const p = patients[0];
    if (!p.face_embedding) return res.json({ patient: null });

    const dist = euclideanDistance(faceEmbedding, p.face_embedding);
    const THRESHOLD = 0.6;

    if (dist > THRESHOLD) return res.json({ patient: null });

    res.json({ patient: p });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
