import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ShowToast } from "../utilities/ShowToast";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const newDepRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedDep, setSelectedDep] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true); // حالت چک کردن ادمین
  const [isUserAdmin, setIsUserAdmin] = useState(false); // آیا کاربر ادمین است؟
  const [lessons, setLessons] = useState({
    records: [],
    status: {
      changePerformed: false,
      tot: 0,
      new: 0,
      repeated: 0,
      updated: 0,
      withoutTime: 0,
    },
  });

  // 🔒 چک کردن وضعیت ادمین بودن کاربر
  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem("access");
      
      if (!token) {
        ShowToast("لطفا ابتدا وارد شوید", "error");
        navigate("/login");
        return;
      }
      
      try {
        // درخواست به endpoint /users/me
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL as string}/users/me`,
          {
            headers: {
              accesstoken: token
            }
          }
        );
        
        if (response.data.isAdmin) {
          setIsUserAdmin(true);
        } else {
          setIsUserAdmin(false);
          ShowToast("شما دسترسی ادمین ندارید", "error");
          setTimeout(() => {
            navigate("/"); // به صفحه اصلی هدایت کن
          }, 2000);
        }
      } catch (err: any) {
        console.error("Error checking admin status:", err);
        setIsUserAdmin(false);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          ShowToast("دسترسی شما منقضی شده است", "error");
          navigate("/login");
        } else {
          ShowToast("خطا در بررسی دسترسی", "error");
          navigate("/");
        }
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // 🔒 فقط اگر ادمین هست دانشکده‌ها را بگیر
  useEffect(() => {
    if (!isUserAdmin) return; // فقط اگر مطمئن شدیم ادمین است
    
    const getDepartments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL as string}/departments/all`,
          {
            headers: {
              accesstoken: localStorage.getItem("access")
            }
          }
        );
        setDepartments(response.data);
      } catch (err: any) {
        console.error("Error fetching departments:", err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          ShowToast("دسترسی شما منقضی شده است", "error");
          navigate("/login");
        }
      }
    };
    
    getDepartments();
  }, [isUserAdmin, navigate]);

  const selectedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const postFile = async (mustSave: boolean) => {
    // 🔒 چک امنیتی اضافی
    if (!isUserAdmin) {
      ShowToast("شما دسترسی ادمین ندارید", "error");
      return;
    }
    
    if (!file) {
      toast.error("لطفا فایل مورد نظر را انتخاب کنید.");
      return;
    }
    if (selectedDep === "") {
      toast.error("لطفا دانشکده مورد نظر را انتخاب کنید.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("department", selectedDep);
    formData.append("shouldSave", mustSave.toString());
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL as string}/lessons/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            accesstoken: localStorage.getItem("access") || ""
          }
        }
      );
      setIsLoading(false);
      const data = await response.json();
      if (mustSave && data.status.changePerformed) {
        toast.success("درس‌های جدید با موفقیت ذخیره شدند.");
      }
      else if (mustSave && !data.status.changePerformed) {
        toast.error("اشتباهی رخ داده است.");
      }
      setLessons(data);
    } catch (error) {
      setIsLoading(false);
      console.error("Upload error:", error);
      toast.error("خطا در آپلود فایل");
    }
  };

  const saveNewDep = async () => {
    // 🔒 چک امنیتی اضافی
    if (!isUserAdmin) {
      ShowToast("شما دسترسی ادمین ندارید", "error");
      return;
    }
    
    const newDep = newDepRef.current?.value;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL as string}/departments/add`,
        {
          dept_name: newDep,
        },
        {
          headers: {
            accesstoken: localStorage.getItem("access")
          }
        }
      );
      if (response.status === 200) {
        toast.success("دانشکده جدید با موفقیت اضافه شد.");
      }
    } catch (err: any) {
      if(err.response.status === 406)
        ShowToast("دسترسی به این قسمت ندارید", "error")
      else
        ShowToast(err.response.message, "error")
    }
  };

  function finalSave() {
    if (!isUserAdmin) {
      ShowToast("شما دسترسی ادمین ندارید", "error");
      return;
    }
    postFile(true);
  }

  // 🔒 نمایش loading هنگام چک کردن ادمین
  if (isCheckingAdmin) {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="text-2xl font-iranYekan">در حال بررسی دسترسی...</div>
        <div className="mt-4 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // 🔒 اگر ادمین نیست، صفحه خالی یا پیام عدم دسترسی
  if (!isUserAdmin) {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center font-iranYekan">
        <div className="text-3xl text-red-600 mb-4">⛔ خیلی بلایی</div>
        <div className="text-xl text-gray-700 mb-6">شما دسترسی ادمین ندارید</div>
        <button 
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-lg"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    );
  }

  // 🔒 فقط اگر ادمین هست، صفحه اصلی را نمایش بده
  return (
    <div className="w-screen h-screen flex flex-col justify-start items-center mt-10 font-iranYekan overflow-hidden">
      <h1 className="text-3xl">«صفحه ادمینی ترمایندر»</h1>
      {lessons.records.length === 0 && (
        <section className="flex flex-row w-4/5 justify-center items-center mt-10 gap-3">
          <input
            ref={newDepRef}
            type="text"
            id="new_dep"
            title="new_department"
            className="w-64 border-2 h-10 px-2 rounded-md"
            style={{ direction: "rtl" }}
            placeholder="افزودن دانشکده جدید"
          />
          <button
            onClick={saveNewDep}
            className="w-auto bg-lime-800 text-slate-100 px-10 py-2 rounded-md hover:bg-lime-900 transition-colors"
          >
            ذخیره
          </button>
        </section>
      )}
      {lessons.records.length === 0 && (
        <section className="flex flex-row w-4/5 justify-center items-center mt-10 gap-3">
          <input
            onChange={selectedFile}
            title="upload_section"
            type="file"
            className="w-auto h-10 rounded-md border p-1"
            style={{ direction: "rtl" }}
            accept=".xlsx,.xls"
          />
          <select
            title="department"
            className="w-auto border-2 px-10 py-2 rounded-md"
            onChange={(e) => {
              setSelectedDep(e.target.value);
            }}
            value={selectedDep}
          >
            <option value="">انتخاب دانشکده</option>
            {departments.map((dep) => (
              <option
                key={dep._id}
                value={dep._id}
                className="flex justify-center items-center text-center"
              >
                {dep.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => postFile(false)}
            disabled={!file || !selectedDep}
            className={`w-auto px-10 py-2 rounded-md ${
              file && selectedDep 
                ? "bg-lime-800 text-slate-100 hover:bg-lime-900" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } transition-colors`}
          >
            {isLoading ? "در حال پردازش..." : "ارسال"}
          </button>
        </section>
      )}
      {/* بقیه کد بدون تغییر */}
      {lessons.records.length !== 0 && (
        <>
          <div className="flex flex-row gap-3 w-3/5 justify-center items-center mt-5 mb-0">
            <button
              onClick={() => {
                setLessons({
                  records: [],
                  status: {
                    changePerformed: false,
                    tot: 0,
                    new: 0,
                    repeated: 0,
                    updated: 0,
                    withoutTime: 0,
                  },
                });
              }}
              className="px-5 py-2 bg-red-900 text-slate-200 rounded-md hover:bg-red-800 transition-colors"
            >
              بیخیال
            </button>
            <button className="px-5 py-2 bg-green-900 text-slate-200 rounded-md hover:bg-green-800 transition-colors" onClick={finalSave}>
              ذخیره نهایی
            </button>
          </div>
          <div className="w-4/5 flex flex-row-reverse gap-8 justify-center text-xl font-bold mt-5">
            <span>کل: {lessons.status.tot}</span>
            <span>تکرار شده‌ها: {lessons.status.repeated}</span>
            <span>جدیدها: {lessons.status.new}</span>
            <span>آپدیت شده‌ها: {lessons.status.updated}</span>
            <span>بدون زمان: {lessons.status.withoutTime}</span>
          </div>
        </>
      )}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg my-8 w-4/5">
        {lessons.records.length != 0 && (
          <table
            className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
            style={{ direction: "rtl" }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-green-900 text-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-right">
                  ردیف
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  نام درس
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  استاد
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  کد درس
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  کد گروه
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  تعداد واحد
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  ظرفیت کلاس
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  جنسیت
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  توضیحات
                </th>
              </tr>
            </thead>
            <tbody>
              {lessons.records.map(({ record }: any, index: number) => (
                <tr
                  key={record._id}
                  className="bg-slate-200 text-gray-900 border-b dark:border-slate-400 hover:bg-slate-300 transition-colors"
                >
                  <td className="py-3 px-6 text-right">{index + 1}</td>
                  <td className="py-3 px-6 text-right">{record.Name}</td>
                  <td className="py-3 px-6 text-right">{record.teacher}</td>
                  <td className="py-3 px-6 text-right">{record.lesson_code}</td>
                  <td className="py-3 px-6 text-right">{record.group_code}</td>
                  <td className="py-3 px-6 text-right">{record.numbers}</td>
                  <td className="py-3 px-6 text-right">{record.capacity}</td>
                  <td className="py-3 px-6 text-right">
                    {record.gender === "both" ? "مختلط" : "تفکیک"}
                  </td>
                  <td className="py-3 px-6 text-right">{record.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}