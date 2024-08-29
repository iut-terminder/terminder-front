import { useState, useEffect } from "react";
import { Course } from "../interfaces/CourseName";
import Schedule from "../components/Schedule";
import axios from "axios";
import { useWindowSize } from "@uidotdev/usehooks";
import { ShowToast } from "../utilities/ShowToast";
import { useNavigate } from "react-router-dom";

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

  const changeSelectValue = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
  };

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
    // check non of them has conflict or preview
    const hasConflict = courses.some((course) => course.hasConflict);
    const hasPreview = courses.some((course) => course.isPreviewing);
    if (hasConflict || hasPreview || courses.length === 0) {
      ShowToast(
        "برنامه‌ت یا خالیه، یا کانفلیکت داره و یا کامل وارد جدول نشده",
        "error"
      );
      return;
    }
    // check if user has already saved his/her schedule
    const token = localStorage.getItem("access");
    if (!token) {
      ShowToast("خطایی رخ داده است!", "error");
      return;
    }
    // const courseIds = courses.map((course) => course._id);
    const courseIds = [];
    for (let i = 0; i < courses.length; i++) {
      courseIds.push({ lesson: courses[i] });
    }
    axios
      .post(
        `${import.meta.env.VITE_API_URL as string}/playlists/add_playlist`,
        {
          playlist: courseIds,
        },
        {
          headers: {
            accesstoken: token,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          ShowToast("برنامه‌ی درسی با موفقیت ذخیره شد!", "success");
          const tmpArray = [...playlists];
          tmpArray.push({
            _id: res.data.id,
            playlist: courses.map((crs) => {
              return { color: "#248F24", lesson: crs };
            }),
          });
          setPlaylists(tmpArray);
        }
      })
      .catch((err) => {
        if (err.response.data.status === "this user have 5 playlist") {
          ShowToast(
            "متاسفانه فعلا بیشتر از ۵ برنامه نمی‌توانید بسازید",
            "error"
          );
        } else {
          ShowToast("خطایی رخ داده است!", "error");
        }
      });
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
    return <p>خیلی بلایی :)</p>;
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
              {courses.map((crs) => {
                return (
                  <span className="bg-slate-400 me-2 mt-2 px-3 py-1 rounded-md text-slate-100">{`${crs.Name}: ${crs.exam_date.date}`}</span>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-center items-center h-2/5 w-full gap-3">
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
              <select
                title="selectCourse"
                className="p-3 border-spacing-1 border-2 rounded-md rtl"
                onChange={changeSelectValue}
              >
                <option value="nothing">آزمایشگاه‌ها</option>
                {allLibs.map((libs) => {
                  // console.log(libs);
                  return (
                    <option key={libs._id} value={libs._id}>
                      {`${libs.Name}، ${dayMappings[libs.times[0].day]}`}
                    </option>
                  );
                })}
              </select>
              <select
                title="selectCourse"
                className="p-3 border-spacing-1 border-2 rounded-md rtl"
                onChange={changeSelectValue}
              >
                <option value="nothing">دروس تئوری</option>
                {allTeoryLessons.map((course) => (
                  <option key={course._id} value={course._id}>
                    {`${course.Name.slice(0, 20)} - ${course.teacher}`}
                  </option>
                ))}
              </select>
              <select
                title="selectDeps"
                className="p-3 border-spacing-1 border-2 rounded-md rtl"
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
                title="save"
                className="bg-green-600 px-5 py-2 rounded-md text-gray-200"
                onClick={() => updateIt(playlists[activeList!]._id)}
              >
                آپدیت
              </button>
              <button
                title="save"
                className="bg-red-700 px-5 py-2 rounded-md text-gray-200"
                onClick={() => deleteIt(playlists[activeList!]._id)}
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
  );
}

export default MainPage;
