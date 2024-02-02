export interface CourseTime {
  start: number;
  end: number;
  day: string;
  isExerciseSolving: boolean;
  _id: string;
}

export interface CourseExamTime {
  start: number;
  end: number;
  day: number;
  date: string;
  _id: string;
}

export interface Course {
  _id: string;
  Name: string;
  times: CourseTime[];
  start: number;
  end: number;
  day: number;
  lesson_code: string;
  group_code: string;
  isPreviewing?: boolean;
  hasConflict?: boolean;
  location: string;
  capacity: number;
  gender: string;
  department: string;
  teacher: string;
  detail: string;
  numbers: number;
  exam_date: CourseExamTime;
}
