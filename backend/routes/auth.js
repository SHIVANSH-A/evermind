import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// REGISTER Caregiver
// POST /auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("caregivers")
      .insert([{ name, email, password: hashedPassword }])
      .select("*");

    if (error) return res.status(400).json({ error: error.message });

    res.json({ caregiver: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN Caregiver
// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: caregiver, error } = await supabase
    .from("caregivers")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !caregiver)
    return res.status(400).json({ error: "Caregiver not found" });

  const isMatch = await bcrypt.compare(password, caregiver.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  // issue JWT
  const token = jwt.sign(
    { id: caregiver.id, role: "caregiver" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, caregiverId: caregiver.id });
});

export default router;
