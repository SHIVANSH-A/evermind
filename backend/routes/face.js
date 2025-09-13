// routes/face.js
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

// POST /face/match
router.post("/match", async (req, res) => {
  try {
    const { patientId, faceEmbedding } = req.body;
    if (!patientId || !faceEmbedding) return res.status(400).json({ error: "patientId and faceEmbedding required" });

    // fetch relatives for this patient
    const { data: relatives, error } = await supabase
      .from("relatives")
      .select("id, name, message, photo_url, face_embedding")
      .eq("patient_id", patientId);

    if (error) return res.status(500).json({ error: error.message });

    if (!relatives || relatives.length === 0) return res.json({ match: null, message: "No relatives stored" });

    // find best match
    let best = null;
    let bestDist = Infinity;
    for (let r of relatives) {
      // skip if no stored embedding
      if (!r.face_embedding) continue;
      const dist = euclideanDistance(faceEmbedding, r.face_embedding);
      if (dist < bestDist) {
        bestDist = dist;
        best = r;
      }
    }

    // threshold — typical face-rec thresholds: 0.4–0.6 for Euclidean (depends on model)
    const THRESHOLD = 0.6;
    if (!best || bestDist > THRESHOLD) {
      return res.json({ match: null, confidence: 1 - bestDist });
    }

    // match found
    res.json({
      match: {
        id: best.id,
        name: best.name,
        message: best.message,
        photo_url: best.photo_url,
        confidence: 1 - bestDist
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
