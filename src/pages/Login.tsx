import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";


export default function Login() {
  // const [showPasswordField, setShowPasswordField] = useState<boolean>(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const secondPasswordRef = useRef<HTMLInputElement>(null);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("email")) {
      nav("/main", { replace: true });
    }
  }, [nav]);

  const validateAndLogin = () => {
    if (
      !emailRef.current.value.trim().endsWith("iut.ac.ir") &&
      !emailRef.current.value.includes("@")
    ) {
      toast("ایمیلی که وارد کرده‌اید متعلق به دانشگاه صنعتی اصفهان نمی‌باشد.", {
        type: "error",
      });
      return;
    }
    if (
      !usernameRef.current.value &&
      !passwordRef.current.value &&
      !emailRef.current.value
    ) {
      toast("لطفا تمامی فیلدها را پر کنید", { type: "error" });
      return;
    }
    if (passwordRef.current.value !== secondPasswordRef.current.value) {
      toast("رمز عبور با تکرارش یکسان نیست", { type: "error" });
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
          toast(err.response.data.error, { type: "error" });
        else if (err.response.data.status)
          toast(err.response.data.status, { type: "error" });
        else toast("خطایی رخ داده است", { type: "error" });
      });
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
      {
        searchParams.get("signup") === "successful" ?
        <div className="h-auto w-96 p-5 bg-green-300 text-green-900 rounded-lg flex flex-col justify-end shadow-xl relative overflow-hidden">
          <span className="text-right">
            ثبت نامت انجام شده و از الآن می‌تونی وارد بشی
          </span>
        </div> :
        <div className="h-auto w-96 p-5 bg-red-300 text-red-900 rounded-lg flex flex-col justify-end shadow-xl relative overflow-hidden">
        <span className="text-right">
          ای بابا. ثبت نامت به مشکل برخورده. یکم وقت دیگه دوباره امتحان کن
        </span>
      </div>
      }
      <div
        className={`${"h-auto"} w-96 p-10 pt-24 rounded-lg mt-5 flex flex-col justify-end shadow-xl relative overflow-hidden`}
      >
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
            <span className="text-right cursor-pointer">
              حساب کاربری دارید؟
            </span>
          </div>
        </div>
        <span className="absolute top-7 -left-28 w-80 text-center overflow-hidden -rotate-45 bg-red-900 text-white p-2 rounded-md select-none">
          نسخه آزمایشی
        </span>
      </div>
    </div>
  );
}
