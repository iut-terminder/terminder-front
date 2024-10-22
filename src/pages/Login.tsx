import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShowToast } from "../utilities/ShowToast";

export default function Login() {
  // const [showPasswordField, setShowPasswordField] = useState<boolean>(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const secondPasswordRef = useRef<HTMLInputElement>(null);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("access") || localStorage.getItem("refresh")) {
      nav("/main", { replace: true });
    }
  }, [nav]);

  useEffect(() => {
    usernameRef.current.value = "";
    passwordRef.current.value = "";
  }, [isLogin]);

  useEffect(() => {
    if (searchParams.get("signup") === "successful" || searchParams.get("session") === "exp")
      setIsLogin(true)
  }, [searchParams])


  const validateAndLogin = () => {
    if (!usernameRef.current.value && !passwordRef.current.value) {
      ShowToast("لطفا تمامی فیلدها را پر کنید", "error");
      return;
    }
    if (isLogin) {
      axios
        .post(`${import.meta.env.VITE_API_URL as string}/users/login`, {
          student_number: usernameRef.current?.value,
          password: passwordRef.current?.value,
        })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem("access", res.data.accessToken)
            localStorage.setItem("refresh", res.data.refreshToken)
            nav("/main", { replace: true });
          }
        })
        .catch((err) => {
          if (err.response.data.error)
            ShowToast(err.response.data.error,"error");
          else if (err.response.data.status)
            ShowToast(err.response.data.status,"error");
          else ShowToast("خطایی رخ داده است","error");
        });
    } else {
      if (
        !emailRef.current.value.trim().endsWith("iut.ac.ir") ||
        !emailRef.current.value.includes("@")
      ) {
        ShowToast(
          "ایمیلی که وارد کرده‌اید متعلق به دانشگاه صنعتی اصفهان نمی‌باشد.",
          "error"
        );
        return;
      }
      if (!emailRef.current.value) {
        ShowToast("لطفا تمامی فیلدها را پر کنید", "error");
        return;
      }
      if (passwordRef.current.value !== secondPasswordRef.current.value) {
        ShowToast("رمز عبور با تکرارش یکسان نیست","error");
        return;
      }
      axios
        .post(`${import.meta.env.VITE_API_URL as string}/users/signup`, {
          student_number: usernameRef.current?.value,
          email: emailRef.current?.value,
          password: passwordRef.current?.value,
          isAdmin: false,
        })
        .then((res) => {
          if (res.status === 200) {
            setVerificationEmailSent(true);
          }
        })
        .catch((err) => {
          if (err.response.data.error)
            ShowToast(err.response.data.error, "error");
          else if (err.response.data.status)
            ShowToast(err.response.data.status, "error");
          else ShowToast("خطایی رخ داده است", "error");
        });
    }
  };


  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen font-iranYekan">
      {verificationEmailSent && (
        <div className="h-auto w-96 p-5 bg-green-300 text-green-900 rounded-lg flex flex-col justify-end shadow-xl relative overflow-hidden">
          <span className="text-right">
            ما ایمیلی براتون ارسال کردیم. لطفا وارد ایمیلون بشید و تایید نهایی
            رو بزنید
          </span>
        </div>
      )}
      {searchParams.get("signup") === "successful" ? (
        <div className="h-auto w-96 p-5 bg-green-300 text-green-900 rounded-lg flex flex-col justify-end shadow-xl relative overflow-hidden">
          <span className="text-right">
            ثبت نامت انجام شده و از الآن می‌تونی وارد بشی
          </span>
        </div>
      ) : searchParams.get("signup") === "failed" ? (
        <div className="h-auto w-96 p-5 bg-red-300 text-red-900 rounded-lg flex flex-col justify-end shadow-xl relative overflow-hidden">
          <span className="text-right">
            ای بابا. ثبت نامت به مشکل برخورده. یکم وقت دیگه دوباره امتحان کن
          </span>
        </div>
      ) : null}
      <div
        className={`${"h-auto"} w-96 p-10 pt-24 rounded-lg mt-5 flex flex-col justify-end shadow-xl relative overflow-hidden`}
      >
        {isLogin ? (
          <div className="w-full flex flex-col justify-center items-center gap-4">
            <div className="flex flex-col gap-3 w-full">
              <input
                ref={usernameRef}
                className="p-3 border-2 rounded-md rtl focus:outline-none"
                placeholder="شماره دانشجویی"
              />
              <input
                ref={passwordRef}
                type="password"
                className="p-3 border-2 rounded-md rtl focus:outline-none"
                placeholder="رمز عبور"
              />
              <button
                className="text-center bg-purple-800 p-3 text-white rounded-xl text-xl"
                title="loginButton"
                onClick={validateAndLogin}
              >
                ورود
              </button>
              <span
                className="text-right cursor-pointer"
                onClick={() => setIsLogin(false)}
              >
                حساب جدید بسازید
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col justify-center items-center gap-4">
            <div className="flex flex-col gap-3 w-full">
              <input
                ref={usernameRef}
                className="p-3 border-2 rounded-md rtl focus:outline-none"
                placeholder="شماره دانشجویی"
              />
              <input
                ref={emailRef}
                className="p-3 border-2 rounded-md rtl focus:outline-none"
                placeholder="ایمیل دانشگاهی"
              />
              <input
                ref={passwordRef}
                type="password"
                className="p-3 border-2 rounded-md rtl focus:outline-none"
                placeholder="رمز عبور"
              />
              <input
                ref={secondPasswordRef}
                type="password"
                className="p-3 border-2 rounded-md rtl focus:outline-none"
                placeholder="تکرار رمز عبور"
              />
              <button
                className="text-center bg-purple-800 p-3 text-white rounded-xl text-xl"
                title="loginButton"
                onClick={validateAndLogin}
              >
                ثبت نام
              </button>
              <span
                className="text-right cursor-pointer"
                onClick={() => setIsLogin(true)}
              >
                حساب کاربری دارید؟
              </span>
            </div>
          </div>
        )}
        <span className="absolute top-7 -left-28 w-80 text-center overflow-hidden -rotate-45 bg-red-900 text-white p-2 rounded-md select-none">
          نسخه آزمایشی
        </span>
      </div>
    </div>
  );
}
