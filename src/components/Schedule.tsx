import { useWindowSize } from "@uidotdev/usehooks";
import { Course } from "../interfaces/CourseName";
import translate_pure_number_to_clock from "../utilities/TranslateToClock";
import translate_to_persian_number from "../utilities/TranslateToPersianNumber";

const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه"];

export default function Schedule({
  courses,
  deleteFunction,
}: {
  courses: Course[];
  deleteFunction: Function;
}) {
  const { width, height }: { width: number | null; height: number | null } =
    useWindowSize();
  const eachNodeWidth: number = width ? (width * 0.8) / 20 : 0;
  const eachNodeHeight: number = height ? (height * 0.6 - 200) / 6 : 0;

  return (
    <div className="grid rtl grid-cols-20 grid-rows-6 gap-y-10 w-4/5 h-3/5 relative my-0 p-0 border-collapse">
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
          return (
            <div
              onDoubleClick={() => {
                deleteFunction(course._id);
              }}
              key={index + timeIndex + Math.random() * 1000}
              className={`${!course.isPreviewing ? "bg-green-900 text-slate-200" : "bg-orange-200 animate-pulse"} ${course.hasConflict ? "bg-red-950" : ""} absolute w-full h-full flex justify-center items-center rounded-md select-none cursor-pointer`}
              style={{
                right: eachNodeWidth * ((time.start - 800) / 50 + 1),
                top:
                  parseInt(time.day) * eachNodeHeight + parseInt(time.day) * 40,
                height: eachNodeHeight,
                width: eachNodeWidth * ((time.end - time.start) / 50),
              }}
            >
              <div className="flex flex-col justify-center items-center">
                <div className="text-center">{course.Name}</div>
              </div>
            </div>
          );
        });
      })}
    </div>
  );
}
