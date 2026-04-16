import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patients.js";
import faceRoutes from "./routes/face.js";
import relativeRoutes from "./routes/relatives.js";
import historyRoutes from "./routes/history.js";
import recommendRoutes from "./routes/recommend.js";
import vitalsRoutes from "./routes/vitals.js";
import vitalPlotsRoutes from "./routes/vitalPlots.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/patient", patientRoutes);
app.use("/face", faceRoutes);
app.use('/relatives', relativeRoutes);
app.use("/history", historyRoutes);
app.use("/recommend", recommendRoutes);
app.use("/vitals", vitalsRoutes);
app.use("/vitalPlots", vitalPlotsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
