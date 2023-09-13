import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPasswordField, setShowPasswordField] = useState<boolean>(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("email")) {
      nav("/main", { replace: true });
    }
  }, [nav]);

  const checkUsernameValidation = () => {
    if (!showPasswordField) {
      if (usernameRef.current?.value) {
        axios
          .post(`${import.meta.env.VITE_API_URL as string}/users/check`, {
            email: usernameRef.current?.value,
          })
          .then((res) => {
            if (res.status === 200) {
              setShowPasswordField(true);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      if (usernameRef.current?.value && passwordRef.current?.value) {
        axios
          .post(`${import.meta.env.VITE_API_URL as string}/users/login`, {
            email: usernameRef.current?.value,
            password: passwordRef.current?.value,
          })
          .then((res) => {
            if (res.status === 200) {
              localStorage.setItem("email", usernameRef.current!.value);
              nav("/main", { replace: true });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen font-iranYekan">
      <div className="w-2/12 p-10 rounded-lg  flex flex-col shadow-xl">
        <div className="w-full flex flex-col justify-center items-center gap-4">
          <div className="flex flex-col gap-3 w-full">
            <input
              ref={usernameRef}
              className="p-3 border-2 rounded-md rtl focus:outline-none"
              placeholder="نام کاربری"
            />
            {showPasswordField && (
              <input
                ref={passwordRef}
                className="p-3 border-2 rounded-md rtl focus:outline-none"
                placeholder="رمز عبور"
              />
            )}
            <button
              className="text-center bg-purple-800 p-3 text-white rounded-xl text-xl"
              title="loginButton"
              onClick={checkUsernameValidation}
            >
              ورود
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
