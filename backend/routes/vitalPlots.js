import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/:patientId", async (req, res) => {
    const { patientId } = req.params;

    try {
        const { data, error } = await supabase
            .from("vitals_logs")
            .select("*")
            .eq("patient_id", patientId)
            .order("id", { ascending: true });

        if (error) return res.status(500).json({ error: error.message });

        if (!data || data.length === 0) {
            return res.json({ vitals: [], insights: {} });
        }

        // Prepare chart data
        const chartData = data.map((v, index) => ({
            index,
            heart_rate: v.heart_rate,
            blood_pressure: v.blood_pressure,
            temperature: v.temperature,
            state: v.state,
        }));

        // Insights
        const avgHeartRate =
            data.reduce((sum, v) => sum + v.heart_rate, 0) / data.length;

        const highBPCount = data.filter(v => v.blood_pressure > 140).length;

        const agitationCount = data.filter(v => v.state === "agitation").length;

        const confusionCount = data.filter(v => v.state === "confusion").length;

        // Trend detection
        const isHeartRateIncreasing =
            data[data.length - 1].heart_rate > data[0].heart_rate;

        res.json({
            chartData,
            insights: {
                avgHeartRate,
                highBPCount,
                agitationCount,
                confusionCount,
                isHeartRateIncreasing,
            },
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;