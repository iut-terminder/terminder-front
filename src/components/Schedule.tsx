import { useWindowSize } from "@uidotdev/usehooks";
import { Course } from "../interfaces/CourseName";
import translate_pure_number_to_clock from "../utilities/TranslateToClock";
import translate_to_persian_number from "../utilities/TranslateToPersianNumber";
import { ImCross } from "react-icons/im";
import { MdContentCopy } from "react-icons/md";
import { PiChecksBold } from "react-icons/pi";
import { toast } from "react-toastify";
import { useState } from "react";

const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه"];

export default function Schedule({
  courses,
  deleteFunction,
  changeColor: submitColor,
  onChangeColor,
  colors,
}: {
  courses: Course[];
  deleteFunction: Function;
  changeColor: any;
  onChangeColor: any;
  colors: object[]
}) {
  const { width, height }: { width: number | null; height: number | null } =
    useWindowSize();
  const eachNodeWidth: number = width ? (width * 0.8) / 20 : 0;
  const eachNodeHeight: number = height ? (height * 0.6 - 200) / 6 : 0;
  const [showCheck, setShowCheck] = useState<object>({});
  // console.log(courses);

  const CopyToClipboard = (value: string) => {
    // copy to clipboard
    navigator.clipboard.writeText(value);
    setShowCheck({ [value]: true });
    toast("کپی شد!", { type: "success" });
    setTimeout(() => {
      setShowCheck({ [value]: false });
    }, 4000);
  };

  return (
    <div className="grid rtl z-50 grid-cols-20 grid-rows-6 gap-y-10 w-4/5 h-3/5 relative my-0 p-0 border-collapse">
      {Array.from({ length: 120 }).map((_, index) => {
        if (index === 0) {
          return <div></div>;
        }
        if (index < 20 && index > 0) {
          return (
            <div className="flex items-end">
              {translate_to_persian_number(
                translate_pure_number_to_clock(800 + (index - 1) * 50)
              )}
            </div>
          );
        } else if (index % 20 === 0) {
          return (
            <div className="flex items-center justify-center">
              {weekDays[index / 20 - 1]}
            </div>
          );
        } else {
          return (
            <div
              key={index}
              className="h-full border-r-2 bord flex justify-center items-center"
            ></div>
          );
        }
      })}
      {courses.map((course, index) => {
        return course.times.map((time, timeIndex) => {
          const getColorObject: any = colors.filter((item: {lessonID: string, color: string}) => item.lessonID === course._id)[0]
          console.log(getColorObject);
        
          return (
            <div
              key={index + timeIndex + Math.random() * 1000}
              className={`${
                course.hasConflict ? "bg-red-950" : ""
              } bg-green-900 text-slate-100 absolute w-full h-full flex justify-center items-center rounded-md select-none cursor-default`}
              style={{
                right: eachNodeWidth * ((time.start - 800) / 50 + 1),
                top:
                  parseInt(time.day + 1) * eachNodeHeight + parseInt(time.day + 1) * 40,
                height: eachNodeHeight,
                width: eachNodeWidth * ((time.end - time.start) / 50),
                backgroundColor: "#26472B",
              }}
            >
              <div className="cp_wrapper">
                <input title={course._id} id={course._id} onChange={onChangeColor} onBlur={submitColor} type="color"/>
              </div>
              <div className="flex flex-col justify-center items-center w-full h-full relative">
                <div className="text-center text-xs"><span>{course.Name}</span>{!course.Name.startsWith("آزمايشگاه") && <span>، {course.teacher.slice(0,3)}</span>}</div>
                <div className="ltr float-right flex flex-row-reverse gap-2 justify-center items-center">
                  <div
                    onClick={() => {
                      CopyToClipboard(course.lesson_code);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    {course.lesson_code}-{course.group_code}
                  </div>
                  <div
                    onClick={() => {
                      CopyToClipboard(course.lesson_code);
                    }}
                    className="cursor-pointer z-20"
                  >
                    {showCheck[course.lesson_code] ? (
                      <PiChecksBold size={15} color="#248F24" />
                    ) : (
                      <MdContentCopy size={15} />
                    )}
                  </div>
                </div>
                <div
                  className="absolute top-1 left-1 p-1 rounded-md bg-red-800 cursor-pointer z-20"
                  onClick={() => {
                    deleteFunction(course._id);
                  }}
                >
                  <ImCross size={8} />
                </div>
              </div>
            </div>
          );
        });
      })}
    </div>
  );
}
