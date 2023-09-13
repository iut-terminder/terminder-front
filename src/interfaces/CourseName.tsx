export interface CourseTime {
  start: number;
  end: number;
  day: string;
  _id: string;
}

export interface Course {
  _id: string;
  Name: string;
  times: CourseTime[];
  start: number;
  end: number;
  day: number;
  isPreviewing?: boolean;
  hasConflict?: boolean;
}
