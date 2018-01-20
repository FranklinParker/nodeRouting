import {Component, OnInit} from '@angular/core';
import {Student} from '../../../shared/models/student';
import {SchoolService} from "../../../shared/services/school.service";

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.component.html',
  styleUrls: ['./student-home.component.css']
})
export class StudentHomeComponent implements OnInit {
  student: Student;
  students: Student[];

  constructor(private schoolService:SchoolService ) {
  }

  ngOnInit() {
    this.schoolService.getStudents().subscribe((studentList: Student[]) => {
        this.students = studentList;
      }
    );
  }

  studentUpdated(student: Student) {
    this.student = student;
  }

}
