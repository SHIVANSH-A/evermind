import express from "express";
import { supabase } from "../supabaseClient.js";
import { spawn } from "child_process";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { heart_rate, bp, temp, state, patient_id } = req.body;

    // ✅ Fetch history
    const { data: history } = await supabase
      .from("patient_history")
      .select("*")
      .eq("patient_id", patient_id);

    const py = spawn("python", [
      "ml/run.py",
      heart_rate,
      bp,
      temp,
      state,
      JSON.stringify(history || [])
    ]);

    let result = "";

    py.stdout.on("data", (data) => {
      result += data.toString();
    });

    py.stderr.on("data", (data) => {
      console.error("PY ERROR:", data.toString());
    });

    py.on("close", () => {
      res.json(JSON.parse(result));
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;