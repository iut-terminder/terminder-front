import MainPage from "./pages/MainPage.tsx";
import Login from "./pages/Login.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route path="/enter" element={<Login />} />
      </Routes>
    </Router>
  );
}
