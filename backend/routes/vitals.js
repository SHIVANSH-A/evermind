import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { patient_id, heart_rate, blood_pressure, temperature, state } = req.body;

    const { error } = await supabase
      .from("vitals_logs")
      .insert([
        {
          patient_id,
          heart_rate,
          blood_pressure,
          temperature,
          state
        }
      ]);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Vitals saved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;