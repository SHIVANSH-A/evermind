import { useEffect, useState } from "react";
import axios from "axios";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from "recharts";

export default function Analytics() {
    const [data, setData] = useState([]);
    const [insights, setInsights] = useState({});
    const [chartType, setChartType] = useState("trend");
    const [trendType, setTrendType] = useState("combined");

    const patientId = "0697d";

    useEffect(() => {
        async function fetchData() {
            const res = await axios.get(
                `http://localhost:5000/vitalPlots/${patientId}`
            );
            setData(res.data.chartData);
            setInsights(res.data.insights);
        }
        fetchData();
    }, []);

    const renderTrendLines = () => {
        switch (trendType) {
            case "heart":
                return <Line dataKey="heart_rate" stroke="#6366f1" strokeWidth={3} />;
            case "bp":
                return <Line dataKey="blood_pressure" stroke="#ef4444" strokeWidth={3} />;
            case "temp":
                return <Line dataKey="temperature" stroke="#10b981" strokeWidth={3} />;
            default:
                return (
                    <>
                        <Line dataKey="heart_rate" stroke="#6366f1" strokeWidth={3} />
                        <Line dataKey="blood_pressure" stroke="#ef4444" strokeWidth={3} />
                        <Line dataKey="temperature" stroke="#10b981" strokeWidth={3} />
                    </>
                );
        }
    };

    const stateData = [
        { name: "Agitation", value: insights.agitationCount || 0 },
        { name: "Confusion", value: insights.confusionCount || 0 }
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* HEADER */}
            <h1 className="text-3xl font-bold text-center mb-10">
                Patient Vital Analytics
            </h1>

            {/* BUTTON CONTROLS */}
            <div className="flex justify-center gap-4 mb-6">
                {["trend", "area", "bar"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`px-5 py-2 rounded-lg font-medium transition ${chartType === type
                            ? "bg-blue-600 text-white shadow"
                            : "bg-white border text-gray-700"
                            }`}
                    >
                        {type === "trend" && "Trend"}
                        {type === "area" && "Intensity"}
                        {type === "bar" && "State"}
                    </button>
                ))}
            </div>

            {/*TREND DROPDOWN */}
            {chartType === "trend" && (
                <div className="flex justify-center mb-6">
                    <select
                        value={trendType}
                        onChange={(e) => setTrendType(e.target.value)}
                        className="px-4 py-2 rounded-lg border bg-white shadow"
                    >
                        <option value="combined">Combined</option>
                        <option value="heart">Heart Rate</option>
                        <option value="bp">Blood Pressure</option>
                        <option value="temp">Temperature</option>
                    </select>
                </div>
            )}

            {/* CHART SECTION */}
            <div className="bg-white p-6 rounded-2xl shadow mb-10">

                {/* LINE CHART */}
                {chartType === "trend" && (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />

                            <XAxis
                                dataKey="index"
                                label={{ value: "Time (Records)", position: "bottom", offset: 1 }}
                            />

                            <YAxis
                                label={{
                                    value: "Vital Values",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 10
                                }}
                            />

                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: 10 }} />

                            {renderTrendLines()}
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {/* AREA CHART */}
                {chartType === "area" && (
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="index" />
                            <YAxis />
                            <Tooltip />
                            <Legend />

                            <Area
                                type="monotone"
                                dataKey="heart_rate"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.2}
                            />

                            <Area
                                type="monotone"
                                dataKey="blood_pressure"
                                stroke="#ef4444"
                                fill="#ef4444"
                                fillOpacity={0.2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}

                {/* BAR CHART */}
                {chartType === "bar" && (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={stateData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />

                            <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* SUMMARY */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm mb-10 border border-blue-100">
                <h2 className="text-lg font-semibold text-blue-700 mb-3">
                    Health Overview
                </h2>

                <p className="text-gray-700 leading-relaxed">
                    The patient’s heart rate is{" "}
                    <span className="font-semibold text-blue-600">
                        {insights.isHeartRateIncreasing
                            ? "showing an upward trend 📈"
                            : "stable 📊"}
                    </span>
                    . There have been{" "}
                    <span className="font-semibold text-red-500">
                        {insights.highBPCount} elevated blood pressure readings
                    </span>{" "}
                    observed.
                </p>

                <p className="text-gray-700 mt-2 leading-relaxed">
                    Behavioral observations include{" "}
                    <span className="font-semibold text-yellow-600">
                        {insights.agitationCount} agitation episodes
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-purple-600">
                        {insights.confusionCount} confusion events
                    </span>
                    .
                </p>

                <p className="text-sm text-gray-500 mt-3">
                    Regular monitoring is recommended for stability.
                </p>
            </div>

            {/* INSIGHT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
                    <p className="text-gray-500 text-sm">Avg Heart Rate</p>
                    <h2 className="text-2xl font-semibold text-indigo-600 mt-1">
                        {insights.avgHeartRate?.toFixed(1)} bpm
                    </h2>
                    <p className="text-xs text-gray-400">Overall average</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
                    <p className="text-gray-500 text-sm">High BP</p>
                    <h2 className="text-2xl font-semibold text-red-500 mt-1">
                        {insights.highBPCount}
                    </h2>
                    <p className="text-xs text-gray-400">Above threshold</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
                    <p className="text-gray-500 text-sm">Agitation</p>
                    <h2 className="text-2xl font-semibold text-yellow-500 mt-1">
                        {insights.agitationCount}
                    </h2>
                    <p className="text-xs text-gray-400">Behavior spikes</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
                    <p className="text-gray-500 text-sm">Confusion</p>
                    <h2 className="text-2xl font-semibold text-purple-500 mt-1">
                        {insights.confusionCount}
                    </h2>
                    <p className="text-xs text-gray-400">Cognitive variation</p>
                </div>

            </div>
        </div>
    );
}