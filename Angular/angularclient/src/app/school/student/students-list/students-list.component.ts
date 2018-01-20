import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Student} from '../../../shared/models/student';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.css']
})
export class StudentsListComponent implements OnInit {
  @Input("students") students: Student[] = [];
  studentSel: Student;
  @Output() studentSelected = new EventEmitter();

  constructor() {

  }

  ngOnInit() {
  }

  selectStudent(id) {
    this.students.forEach((student: Student) => {
      if (id === student.id) {
        this.studentSel = student;
        this.studentSelected.emit(student);
      }
    });

  }

}
