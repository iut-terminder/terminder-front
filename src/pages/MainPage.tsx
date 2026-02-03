import { useState, useEffect } from "react";
import { Course } from "../interfaces/CourseName";
import Schedule from "../components/Schedule";
import axios from "axios";
import { useWindowSize } from "@uidotdev/usehooks";
import { ShowToast } from "../utilities/ShowToast";
import { useNavigate } from "react-router-dom";
import SearchableSelect from "../components/SearchableSelect";

function MainPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [deps, setDeps] = useState([]);
  const [allAvailableCourses, setAllAvailableCourses] = useState<Course[]>([]);
  const [allLibs, setAllLibs] = useState<Course[]>([]);
  const [allTeoryLessons, setAllTeoryLessons] = useState<Course[]>([]);
  const [playlists, setPlaylists] = useState([]);
  const [activeList, setActiveList] = useState<number>();
  const [goCheckConflict, setGoCheckConflict] = useState<boolean>(false);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  // const [selectedColor, setSeclctedColor] = useState<string>("")
  const [lessonColors, setLessonColors] = useState([]);
  const { width }: { width: number | null } = useWindowSize();
  const nav = useNavigate();
  let selectedColor = ""
  const dayMappings = {
    0: "شنبه",
    1: "یکشنبه",
    2: "دوشنبه",
    3: "سه شنبه",
    4: "چهارشنبه",
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL as string}/departments/all`, {
        headers: {
          accesstoken: localStorage.getItem("access"),
        },
      })
      .then((res) => {
        setDeps(res.data);
      })
      .catch((err) => {
        if (err.response.status >= 400) {
          ShowToast(
            "نشست شما منقضی شده است. به صفحه ورود منتقل می‌شوید...",
            "info"
          );
          setTimeout(() => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            nav("/?session=exp", { replace: true });
          }, 2000);
        }
      });
  }, []);

  useEffect(() => {
    if (deps.length > 0) {
      axios
        .get(`${import.meta.env.VITE_API_URL as string}/lessons/all`, {
          headers: {
            accesstoken: localStorage.getItem("access"),
          },
        })
        .then((res) => {
          const tmp: Course[] = res.data;
          const tmpData: Course[] = [];
          for (let i = 0; i < tmp.length; i++) {
            tmpData.push(tmp[i]);
          }
          setAllAvailableCourses(tmpData);
        });
      axios
        .get(
          `${import.meta.env.VITE_API_URL as string}/playlists/get_playlist`,
          {
            headers: {
              accesstoken: localStorage.getItem("access"),
            },
          }
        )
        .then((res) => {
          // console.log(res);
          setPlaylists(res.data);
        });
    }
  }, [deps]);

  const deleteCourse = (id: string) => {
    const findCourse = courses.find((course) => course._id === id);
    if (!findCourse) {
      ShowToast("خطایی رخ داده است!", "error");
      return;
    }
    const newCourses = courses.filter((course) => course._id !== id);
    setCourses(newCourses);
    if (findCourse.hasConflict) {
      setGoCheckConflict(true);
    }
  };

  /*const changeSelectValue = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourse = allAvailableCourses.find(
      (course) => course._id === e.target.value
    );
    const isAlreadyAdded = courses.some(
      (course) => course._id === e.target.value
    );
    const sameLessonWithAnotherTime = courses.some(
      (course) =>
        course.Name.split("-")[0].trim() ===
        selectedCourse!.Name.split("-")[0].trim()
    );
    if (isAlreadyAdded || sameLessonWithAnotherTime) {
      ShowToast("این درس قبلا اضافه شده است!", "error");
      return;
    }
    if (selectedCourse) {
      const tempObject = { ...selectedCourse };
      setCourses([...courses, tempObject]);
      setGoCheckConflict(true);
    }
  };*/

  const changeSelectValueForDeps = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const tmpArray: Course[] = [];
    for (let i = 0; i < allAvailableCourses.length; i++) {
      if (allAvailableCourses[i].department === e.target.value)
        tmpArray.push(allAvailableCourses[i]);
    }
    setAllLibs(
      tmpArray.filter((crs) => {
        return (
          crs.Name.startsWith("آزمايشگاه") ||
          crs.Name.startsWith("ازمايشگاه") ||
          crs.Name.startsWith("كارگاه")
        );
      })
    );
    setAllTeoryLessons(
      tmpArray.filter((crs) => {
        return (
          !crs.Name.startsWith("آزمايشگاه") &&
          !crs.Name.startsWith("ازمايشگاه") &&
          !crs.Name.startsWith("كارگاه")
        );
      })
    );
  };

  useEffect(() => {
    if (courses) {
      let tmpTotal: number = 0;
      for (let i = 0; i < courses.length; i++) tmpTotal += courses[i].numbers;
      setTotalCredit(tmpTotal);
    }
  }, [courses]);

  useEffect(() => {
    if (goCheckConflict === true) {
      const conflictedLessons: string[] = [];
      const tmpCourses = [...courses];
      for (let i = 0; i < courses.length; i++) {
        for (let j = i + 1; j < courses.length; j++) {
          if (hasTimeConflict(courses[i], courses[j])) {
            conflictedLessons.push(courses[i]._id, courses[j]._id);
          }
        }
      }
      const newCourses = tmpCourses.map((course) => {
        if (conflictedLessons.includes(course._id)) {
          course["hasConflict"] = true;
        } else course["hasConflict"] = false;
        delete course.isPreviewing;
        return course;
      });
      setCourses(newCourses);
      setGoCheckConflict(false);
    }
  }, [goCheckConflict, courses]);

  useEffect(() => {
    if (activeList === undefined) {
      return;
    }
    const newCourses: Course[] = [];
    for (let i = 0; i < playlists[activeList].playlist.length; i++) {
      newCourses.push(playlists[activeList].playlist[i].lesson);
    }
    setCourses(newCourses);
  }, [playlists, activeList]);

  const saveIt = () => {
    console.log("دکمه ذخیره کلیک شد");
    
    // بررسی‌های اولیه
    if (courses.length === 0) {
      ShowToast("برنامه خالی است!", "error");
      return;
    }
    
    const hasConflict = courses.some((course) => course.hasConflict);
    const hasPreview = courses.some((course) => course.isPreviewing);
    if (hasConflict || hasPreview) {
      ShowToast("برنامه یا تداخل دارد یا کامل وارد جدول نشده", "error");
      return;
    }
    
    const token = localStorage.getItem("access");
    if (!token) {
      ShowToast("خطایی رخ داده است!", "error");
      return;
    }
    
    // 🔴 اصلاح این بخش - اضافه کردن color
    const playlistData = [];
    for (let i = 0; i < courses.length; i++) {
      playlistData.push({ 
        color: "#248F24", // این خط اضافه شد
        lesson: courses[i]._id 
      });
    }
    
    console.log("📤 داده‌های ارسالی:", { playlist: playlistData });
    
    axios
      .post(
        `${import.meta.env.VITE_API_URL as string}/playlists/add_playlist`,
        {
          playlist: playlistData, // نام متغیر را هم بهتر است تغییر دهید
        },
        {
          headers: {
            accesstoken: token,
            'Content-Type': 'application/json' // این هم خوب است اضافه شود
          },
        }
      )
      .then((res) => {
        console.log("✅ پاسخ سرور:", res.data);
        if (res.status === 200) {
          ShowToast("برنامه‌ی درسی با موفقیت ذخیره شد!", "success");
          
          // ایجاد پلی‌لیست جدید
          const newPlaylist = {
            _id: res.data.id,
            playlist: playlistData.map(item => ({
              color: item.color,
              lesson: courses.find(c => c._id === item.lesson)
            }))
          };
          
          setPlaylists(prev => [...prev, newPlaylist]);
        }
      })
      .catch((err) => {
        console.error("❌ خطا:", err.response?.data || err.message);
        
        if (err.response?.data?.status === "this user have 5 playlist") {
          ShowToast("متاسفانه فعلا بیشتر از ۵ برنامه نمی‌توانید بسازید", "error");
        } else if (err.response?.status === 400) {
          ShowToast("داده‌های ارسالی نامعتبر است", "error");
        } else {
          ShowToast("خطایی رخ داده است!", "error");
        }
      });
  };

  const getTeoryOptions = () => {
    return allTeoryLessons.map(course => ({
      value: course._id,
      label: course.Name, // نام کامل درس
      subLabel: `${course.teacher}`,
      data: course
    }));
  };

  const formatTimeSimple = (timeNumber: number): string => {
    if (!timeNumber || timeNumber < 0) return "";
    
    const timeStr = String(timeNumber).padStart(4, '0');
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
  };

  const getLibOptions = () => {
    return allLibs.map(lib => ({
      value: lib._id,
      label: lib.Name,
      subLabel: `${lib.times?.[0] ? dayMappings[lib.times[0].day] : ""} | ${lib.times?.[0]?.start ? formatTimeSimple(lib.times[0].start) : ""}`,
      data: lib
    }));
  };

  const handleCourseSelect = (selectedOption: any) => {
    if (!selectedOption || !selectedOption.data) return;
    
    const selectedCourse = selectedOption.data;
    const isAlreadyAdded = courses.some(
      (course) => course._id === selectedCourse._id
    );
    const sameLessonWithAnotherTime = courses.some(
      (course) =>
        course.Name.split("-")[0].trim() ===
        selectedCourse.Name.split("-")[0].trim()
    );
    
    if (isAlreadyAdded || sameLessonWithAnotherTime) {
      ShowToast("این درس قبلا اضافه شده است!", "error");
      return;
    }
    
    const tempObject = { ...selectedCourse };
    setCourses([...courses, tempObject]);
    setGoCheckConflict(true);
    ShowToast(`درس ${selectedCourse.Name} اضافه شد`, "success");
  };

  function hasTimeConflict(course1: Course, course2: Course) {
    // console.log(course1);
    // console.log(course2);
    for (const time1 of course1.times) {
      for (const time2 of course2.times) {
        if (
          time1.day === time2.day &&
          time1.start < time2.end &&
          time1.end > time2.start &&
          time1.isExerciseSolving === false &&
          time2.isExerciseSolving === false
        ) {
          return true;
        }
      }
    }
    return false;
  }

  const activatePlayList = (index: number) => {
    if (activeList === index) {
      setCourses([]);
      setActiveList(undefined);
      return;
    }
    const newCourses: Course[] = [];
    const newCourseColorMappings = [];
    for (let i = 0; i < playlists[index].playlist.length; i++) {
      newCourses.push(playlists[index].playlist[i].lesson);
      newCourseColorMappings.push({
        lessonID: playlists[index].playlist[i].lesson._id,
        color: playlists[index].playlist[i].color,
      });
    }
    setCourses(newCourses);
    setLessonColors(newCourseColorMappings);
    setActiveList(index);
  };

  const deleteIt = (id: string) => {
    const token = localStorage.getItem("access");
    axios
      .delete(
        `${import.meta.env.VITE_API_URL as string}/playlists/delete_playlist`,
        {
          data: {
            id,
          },
          headers: {
            accesstoken: token,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          ShowToast("برنامه با موفقیت حذف شد!", "success");
          const tmpArray = [...playlists];
          tmpArray.splice(activeList!, 1);
          setPlaylists(tmpArray);
          activatePlayList(0);
        }
      })
      .catch(() => {
        ShowToast("خطایی رخ داده است!", "error");
      });
  };

  const updateIt = (id: string) => {
    const token = localStorage.getItem("access");
    const courseIds = courses.map((course) => course._id);
    const canBeAddCourse: { color: string; lesson: string }[] = [];
    for (let i = 0; i < courseIds.length; i++) {
      const tmp: { color: string; lesson: string } = {
        color: "#248F24",
        lesson: courseIds[i],
      };
      canBeAddCourse.push(tmp);
    }
    axios
      .post(
        `${import.meta.env.VITE_API_URL as string}/playlists/edit_playlist`,
        {
          id,
          playlist: canBeAddCourse,
        },
        {
          headers: {
            accesstoken: token,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          ShowToast("برنامه با موفقیت آپدیت شد!", "success");
          const copyPlaylist = [...playlists];
          const targetPlaylist = copyPlaylist.find((item) => item._id === id);
          const tmpCourse: { color: string; lesson: Course }[] = [];
          for (let i = 0; i < courses.length; i++) {
            const tmp: { color: string; lesson: Course } = {
              color: "#248F24",
              lesson: courses[i],
            };
            tmpCourse.push(tmp);
          }
          targetPlaylist.playlist = tmpCourse;
          // console.log(copyPlaylist);
          setPlaylists(copyPlaylist);
        }
      })
      .catch(() => {
        ShowToast("خطایی رخ داده است!", "error");
      });
  };

  function changeColor(e) {
    const lesson_id = e.target.id;
    // const newColor = e.target.value;
    // console.log(lesson_id, newColor);
    const newColors = [...lessonColors];
    const targetIndex = newColors.findIndex(
      (item) => item.lessonID === lesson_id
    );
    newColors[targetIndex].color = selectedColor;
    setLessonColors(newColors);
  }

  function getColor(e) {
    selectedColor = e.target.value
  }

  if (!localStorage.getItem("access")) {
    return <p>خیلی بلایی :|</p>;
  }

  if (width! < 1200) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen font-iranYekan rtl">
        <p className="text-2xl font-bold px-10">
          متاسفانه فعلا پشتیبانی‌ای روی دیوایس های زیر ۱۲۰۰ پیکسل نداریم!
        </p>
      </div>
    );
  }

  /*return (
    <>
      <div className="flex flex-col justify-start items-center h-screen w-screen font-iranYekan relative">
        <Schedule
          changeColor={changeColor}
          colors={lessonColors}
          courses={courses}
          onChangeColor={getColor}
          deleteFunction={deleteCourse}
        />
        <div className="h-2/5 w-4/5 flex flex-col items-end">
          <div className="flex flex-col w-full items-end mt-5">
            <span className="font-bold" style={{ direction: "rtl" }}>
              مجموع واحدها: {totalCredit} | زمان‌بندی امتحانات:
            </span>
            <div className="flex flex-row w-4/5 justify-end flex-wrap">
              {courses.map((crs, index) => {
                return (
                  <span 
                    key={index} // اضافه کردن key
                    className="bg-slate-400 me-2 mt-2 px-3 py-1 rounded-md text-slate-100"
                  >
                    {`${crs.Name}: ${crs.exam_date.date}`}
                  </span>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 justify-center items-center h-2/5 w-full">
            <div className="flex flex-row-reverse justify-center items-center w-full gap-3">
              {playlists &&
                playlists.map((playlist, index) => {
                  return (
                    <div
                      onClick={() => {
                        activatePlayList(index);
                      }}
                      key={index}
                      id={playlist._id}
                      className={`${
                        index === activeList
                          ? "bg-gray-500 border-white text-white"
                          : "text-black"
                      } px-12 py-2 rounded-ss-md rounded-2xl border-2 text-lg relative cursor-pointer`}
                    >
                      {index}
                    </div>
                  );
                })}
            </div>
            
            <div className="flex flex-row justify-center items-center gap-3 w-1/2">
              <SearchableSelect
                options={getLibOptions()}
                placeholder="جستجوی آزمایشگاه..."
                onSelect={handleCourseSelect}
                disabled={allLibs.length === 0}
                className="w-80"
              />
              
              <SearchableSelect
                options={getTeoryOptions()}
                placeholder="جستجوی درس تئوری..."
                onSelect={handleCourseSelect}
                disabled={allTeoryLessons.length === 0}
                className="w-80"
              />
              
              <select
                title="selectDeps"
                className="p-3 border-2 border-gray-300 rounded-md rtl w-56 focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none"
                onChange={changeSelectValueForDeps}
              >
                <option value="nothing-dep">دانشکده‌ها</option>
                {deps.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.title}
                  </option>
                ))}
              </select>
              
              <button
                title="save"
                className="bg-teal-700 px-5 py-2 rounded-md text-gray-200"
                onClick={saveIt}
              >
                ذخیره
              </button>
              <button
                title="update"
                className="bg-green-600 px-5 py-2 rounded-md text-gray-200"
                onClick={() => updateIt(playlists[activeList!]._id)}
                disabled={activeList === undefined}
              >
                آپدیت
              </button>
              <button
                title="delete"
                className="bg-red-700 px-5 py-2 rounded-md text-gray-200"
                onClick={() => deleteIt(playlists[activeList!]._id)}
                disabled={activeList === undefined}
              >
                حذف
              </button>
            </div>
          </div>
          
          <div className="absolute bottom-0 right-0 left-0 text-center px-6 pt-2 select-none -z-50">
            Made with ❤️ Atid Khodaei /&/ Amirhossein Zendevani
          </div>
        </div>
      </div>
    </>
  );*/

  return (
    <>
      <div className="flex flex-col justify-start items-center h-screen w-screen font-iranYekan relative">
        <Schedule
          changeColor={changeColor}
          colors={lessonColors}
          courses={courses}
          onChangeColor={getColor}
          deleteFunction={deleteCourse}
        />
        <div className="h-2/5 w-4/5 flex flex-col items-end">
          <div className="flex flex-col w-full items-end mt-5">
            <span className="font-bold" style={{ direction: "rtl" }}>
              مجموع واحدها: {totalCredit} | زمان‌بندی امتحانات:
            </span>
            <div className="flex flex-row w-4/5 justify-end flex-wrap">
              {courses.map((crs, index) => { // اضافه کردن key
                return (
                  <span 
                    key={index} // اضافه کردن key
                    className="bg-slate-400 me-2 mt-2 px-3 py-1 rounded-md text-slate-100"
                  >
                    {`${crs.Name}: ${crs.exam_date.date}`}
                  </span>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 justify-center items-center h-2/5 w-full">
            <div className="flex flex-row-reverse justify-center items-center w-full gap-3">
              {/* لیست پلی‌لیست‌ها */}
              {playlists &&
                playlists.map((playlist, index) => {
                  return (
                    <div
                      onClick={() => {
                        activatePlayList(index);
                      }}
                      key={index}
                      id={playlist._id}
                      className={`${
                        index === activeList
                          ? "bg-gray-500 border-white text-white"
                          : "text-black"
                      } px-12 py-2 rounded-ss-md rounded-2xl border-2 text-lg relative cursor-pointer`}
                    >
                      {index}
                    </div>
                  );
                })}
            </div>
            
            {/* بخش جستجو و انتخاب */}
            <div className="flex flex-row justify-center items-center gap-4 w-3/4">
              {/* آزمایشگاه‌ها */}
              <div className="w-96">
                <SearchableSelect
                  options={getLibOptions()}
                  placeholder="آزمایشگاه ها"
                  onSelect={handleCourseSelect}
                  disabled={allLibs.length === 0}
                />
                {allLibs.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    ابتدا دانشکده را انتخاب کنید
                  </p>
                )}
              </div>
              
              {/* دروس تئوری */}
              <div className="w-96">
                <SearchableSelect
                  options={getTeoryOptions()}
                  placeholder=" درس تئوری"
                  onSelect={handleCourseSelect}
                  disabled={allTeoryLessons.length === 0}
                />
                {allTeoryLessons.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    ابتدا دانشکده را انتخاب کنید
                  </p>
                )}
              </div>
              
              {/* دانشکده‌ها */}
              <select
                title="selectDeps"
                className="p-4 h-14 text-lg border-2 border-gray-300 rounded-lg rtl focus:border-teal-600 focus:ring-4 focus:ring-teal-200 outline-none w-56"
                onChange={changeSelectValueForDeps}
              >
                <option value="nothing-dep">🏛️ دانشکده‌ها</option>
                {deps.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.title}
                  </option>
                ))}
              </select>
              
              {/* دکمه‌ها */}
              <div className="flex gap-2">
                <button
                  title="save"
                  className="bg-teal-600 hover:bg-teal-700 px-6 py-3 h-14 text-lg rounded-lg text-white" // text-gray-200 به text-white تغییر دادم
                  onClick={saveIt}
                >
                  ذخیره
                </button>
                <button
                  title="update"
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 h-14 text-lg rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => updateIt(playlists[activeList!]?._id)}
                  disabled={activeList === undefined || !playlists[activeList]}
                >
                  آپدیت
                </button>
                <button
                  title="delete"
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 h-14 text-lg rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => deleteIt(playlists[activeList!]?._id)}
                  disabled={activeList === undefined || !playlists[activeList]}
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
          
          {/* footer */}
          <div className="absolute bottom-0 right-0 left-0 text-center px-6 pt-2 select-none -z-50">
            Made with ❤️ Atid Khodaei /&/ Amirhossein Zendevani
          </div>
        </div> {/* این div بسته شد */}
      </div>
    </>
  );
}

export default MainPage;
