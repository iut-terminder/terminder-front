import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <ToastContainer
      position="top-right"
      bodyStyle={{ direction: "rtl" }}
      className="font-iranYekan"
      autoClose={3000}
    />
    <App />
  </>
);
