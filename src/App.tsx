import MainPage from "./pages/MainPage.tsx";
import Login from "./pages/Login.tsx";
import Admin from "./pages/Admin.tsx";
import { useWindowSize } from "@uidotdev/usehooks";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  const size = useWindowSize();

  if (size.width < 1200) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen font-iranYekan rtl">
        <p className="text-2xl font-bold px-10">
          متاسفانه فعلا پشتیبانی‌ای روی دیوایس های زیر ۱۲۰۰ پیکسل نداریم!
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
