import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Student} from '../models/student';
import {environment} from '../../../environments/environment';
import {Course} from "../models/course";

@Injectable()
export class SchoolService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('ApiUrl:' + environment.apiUrl);
  }

  getStudents(): Observable<Student[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    // .set('Access-Control-Allow-Origin', '*')
    // .set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return this.http.get(this.apiUrl + 'students')
      .map((response: { students: any[], message: string }) => {
        const studentList: Student[] = [];
        const students = response.students;
        students.forEach(student => studentList.push(new Student(student._id,
          student.firstName, student.lastName)));

        return studentList;
      });

  }

  getStudent(id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get(this.apiUrl + 'students/' + id)
      .map((response: { student: any, message: string }) => {
        const student = response.student;
        return new Student(student._id, student.firstName, student.lastName);
      });

  }

  /**
   *
   *
   * @returns {Observable<Course[]>}
   */

  getCourses(): Observable<Course[]> {
    return this.http.get(this.apiUrl + 'courses')
      .map((courses: Course []) => {
        const courseList: Course[] = [];
        courses.forEach((course: Course) => courseList.push(new Course(course.courseName, course.professor, course.classSchedule)));
        return courseList;
      });
  }

  updateStudent(student: Student): Observable<any> {
     return this.http.post(this.apiUrl + 'students/update', student)
      .map((response: Response) => {
        return response;

      });

  }


}
