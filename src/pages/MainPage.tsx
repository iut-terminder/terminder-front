import { useState, useEffect } from "react";
import { Course } from "../interfaces/CourseName";
import Schedule from "../components/Schedule";
import axios from "axios";
import { toast } from "react-toastify";
import { useWindowSize } from "@uidotdev/usehooks";

function MainPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allAvailableCourses, setAllAvailableCourses] = useState<Course[]>([]);
  const [playlists, setPlaylists] = useState([]);
  const [activeList, setActiveList] = useState<number>();
  const [goCheckConflict, setGoCheckConflict] = useState<boolean>(false);
  const { width }: { width: number | null } = useWindowSize();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL as string}/lessons/all`)
      .then((res) => {
        setAllAvailableCourses(res.data);
      });
    axios
      .post(`${import.meta.env.VITE_API_URL as string}/users/get_playlist`, {
        email: localStorage.getItem("email"),
      })
      .then((res) => {
        setPlaylists(res.data);
      });
  }, []);

  const deleteCourse = (id: string) => {
    const findCourse = courses.find((course) => course._id === id);
    if (!findCourse) {
      toast("خطایی رخ داده است!", { type: "error" });
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
      toast("این درس قبلا اضافه شده است!", { type: "error" });
      return;
    }
    if (selectedCourse) {
      const tempObject = { ...selectedCourse };
      setCourses([...courses, tempObject]);
      setGoCheckConflict(true);
    }
  };

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
    const newCourses = [...playlists[activeList].playlist];
    setCourses(newCourses);
  }, [playlists, activeList])

  const saveIt = () => {
    // check non of them has conflict or preview
    const hasConflict = courses.some((course) => course.hasConflict);
    const hasPreview = courses.some((course) => course.isPreviewing);
    if (hasConflict || hasPreview || courses.length === 0) {
      toast("برنامه‌ت یا خالیه، یا کانفلیکت داره و یا کامل وارد جدول نشده", {
        type: "error",
      });
      return;
    }
    // check if user has already saved his/her schedule
    const email = localStorage.getItem("email");
    if (!email) {
      toast("خطایی رخ داده است!", { type: "error" });
      return;
    }
    const courseIds = courses.map((course) => course._id);
    axios
      .post(`${import.meta.env.VITE_API_URL as string}/users/add_playlist`, {
        email,
        playlist: { playlist: courseIds },
      })
      .then((res) => {
        if (res.status === 200) {
          toast("برنامه‌ی درسی با موفقیت ذخیره شد!", { type: "success" });
          const tmpArray = [...playlists];
          console.log(tmpArray);
          tmpArray.push({_id: res.data.id, playlist: courses});
          console.log(tmpArray);
          setPlaylists(tmpArray);
        }
      })
      .catch((err) => {
        if (err.response.data.status === "this user have 5 playlist") {
          toast("متاسفانه فعلا بیشتر از ۵ برنامه نمی‌توانید بسازید", {
            type: "error",
          });
        } else {
          toast("خطایی رخ داده است!", { type: "error" });
        }
      });
  };

  function hasTimeConflict(course1: Course, course2: Course) {
    for (const time1 of course1.times) {
      for (const time2 of course2.times) {
        if (
          time1.day === time2.day &&
          time1.start < time2.end &&
          time1.end > time2.start
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
    const newCourses = [...playlists[index].playlist];
    setCourses(newCourses);
    setActiveList(index);
  };

  const deleteIt = (id: string) => {
    const email = localStorage.getItem("email");
    axios
      .delete(
        `${import.meta.env.VITE_API_URL as string}/users/delete_playlist`,
        {
          data: {
            email,
            id,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          toast("برنامه با موفقیت حذف شد!", { type: "success" });
          const tmpArray = [...playlists];
          tmpArray.splice(activeList!, 1);
          setPlaylists(tmpArray);
          activatePlayList(0);
        }
      })
      .catch(() => {
        toast("خطایی رخ داده است!", { type: "error" });
      });
  };

  const updateIt = (id: string) => {
    const email = localStorage.getItem("email");
    const courseIds = courses.map((course) => course._id);
    axios
      .post(`${import.meta.env.VITE_API_URL as string}/users/edit_playlist`, {
        email,
        id,
        playlist: { playlist: courseIds },
      })
      .then((res) => {
        if (res.status === 200) {
          toast("برنامه با موفقیت آپدیت شد!", { type: "success" });
          console.log(courses);
          const targetObject = playlists.find(item => item._id === id);
          targetObject.playlist = courses;
          setPlaylists(playlists);
        }
      })
      .catch(() => {
        toast("خطایی رخ داده است!", { type: "error" });
      });
  };

  if (!localStorage.getItem("email")) {
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
        <Schedule courses={courses} deleteFunction={deleteCourse} />
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
          <div className="flex flex-row justify-center items-center gap-3">
            <select
              title="selectCourse"
              className="p-3 border-spacing-1 border-2 rounded-md rtl"
              onChange={changeSelectValue}
            >
              <option value="nothing">لیست دروس</option>
              {allAvailableCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.Name}
                </option>
              ))}
            </select>
            <button
              title="save"
              className="bg-teal-700 px-5 py-2 rounded-md text-gray-200"
              onClick={saveIt}
            >
              ذخیره برنامه
            </button>
            <button
              title="save"
              className="bg-green-600 px-5 py-2 rounded-md text-gray-200"
              onClick={() => updateIt(playlists[activeList!]._id)}
            >
              آپدیت برنامه
            </button>
            <button
              title="save"
              className="bg-red-700 px-5 py-2 rounded-md text-gray-200"
              onClick={() => deleteIt(playlists[activeList!]._id)}
            >
              حذف برنامه
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 border-t-2 border-t-slate-400 px-6 py-2 mb-2 select-none">
          Made with ❤️ Atid Khodaei /&/ Amirhossein Zendevani
        </div>
      </div>
    </>
  );
}

export default MainPage;
