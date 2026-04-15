import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Save caregiver feedback
router.post("/", async (req, res) => {
  try {
    const { patient_id, intervention, success } = req.body;

    // basic validation
    if (!patient_id || !intervention || success === undefined) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { error } = await supabase
      .from("patient_history")
      .insert([
        {
          patient_id,
          intervention,
          success,
        },
      ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Feedback saved successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;