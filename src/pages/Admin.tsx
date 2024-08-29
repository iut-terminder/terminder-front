import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ShowToast } from "../utilities/ShowToast";

export default function Admin() {
  const [departments, setDepartments] = useState([]);
  const newDepRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState();
  const [selectedDep, setSelectedDep] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const selectedFile = (e) => {
    setFile(e.target.files[0]);
  };

  const postFile = async (mustSave: boolean) => {
    if (!file) {
      toast.error("لطفا فایل مورد نظر را انتخاب کنید.");
      return;
    }
    if (selectedDep === "") {
      toast.error("لطفا دانشکده مورد نظر را انتخاب کنید.");
      return;
    }
    const formData = new FormData() as any;
    formData.append("file", file);
    formData.append("department", selectedDep);
    formData.append("shouldSave", mustSave);
    setIsLoading(true);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL as string}/lessons/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
            accesstoken: localStorage.getItem("access")
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
  };

  const saveNewDep = async () => {
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
    } catch (err) {
      if(err.response.status === 406)
        ShowToast("دسترسی به این قسمت ندارید", "error")
      else
        ShowToast(err.response.message, "error")
    }
  };

  useEffect(() => {
    const getDepartments = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL as string}/departments/all`,
        {
          headers: {
            accesstoken: localStorage.getItem("access")
          }
        }
      );
      setDepartments(response.data);
    };
    getDepartments();
  }, []);

  function finalSave() {
    postFile(true);
  }

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
            className="w-auto bg-lime-800 text-slate-100 px-10 py-2 rounded-md"
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
            className="w-auto h-10 rounded-md"
            style={{ direction: "rtl" }}
          />
          <select
            title="department"
            className="w-auto border-2 px-10 py-2 rounded-md"
            onChange={(e) => {
              setSelectedDep(e.target.value);
            }}
          >
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
            type="submit"
            onClick={() => postFile(false)}
            disabled={file ? false : true}
            className="w-auto bg-lime-800 text-slate-100 px-10 py-2 rounded-md"
          >
            {isLoading ? "در حال پردازش..." : "ارسال"}
          </button>
        </section>
      )}
      {/* Show Pewview Lessons */}
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
              className="px-5 py-2 bg-red-900 text-slate-200 rounded-md"
            >
              بیخیال
            </button>
            <button className="px-5 py-2 bg-green-900 text-slate-200 rounded-md" onClick={finalSave}>
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
              {lessons.records.map(({ record }, index) => (
                <tr
                  key={record._id}
                  className="bg-slate-200 text-gray-900 border-b dark:border-slate-400"
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
                  {/* <td>{record.status}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
