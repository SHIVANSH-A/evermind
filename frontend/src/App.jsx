import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CaregiverLogin from "./pages/Login";
import CaregiverRegister from "./pages/Register";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import AddRelative from "./pages/AddRelative";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Caregiver */}
        <Route path="/caregiver/login" element={<CaregiverLogin />} />
        <Route path="/caregiver/register" element={<CaregiverRegister />} />
        <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />

        {/* Patient */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/relatives/add" element={<AddRelative/>} />
      </Routes>
    </Router>
  );
}

export default App;
