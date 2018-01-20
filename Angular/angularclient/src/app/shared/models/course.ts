export class Course {
  courseName: string;
  professor: string;
  classSchedule: string;

  constructor(courseName: string,
              professor: string,
              classSchedule: string) {
    this.courseName = courseName;
    this.classSchedule = classSchedule;
    this.professor = professor;

  }


}
