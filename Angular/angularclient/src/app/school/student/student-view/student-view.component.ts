import { Component, OnInit, Input } from '@angular/core';
import {Student} from '../../../shared/models/student';
import {SchoolService} from "../../../shared/services/school.service";

@Component({
  selector: 'app-student-view',
  templateUrl: './student-view.component.html',
  styleUrls: ['./student-view.component.css']
})
export class StudentViewComponent implements OnInit {
  @Input('student') student: Student;
  constructor(private schoolService: SchoolService) { }

  ngOnInit() {
  }
  save(){
    console.log('save ', this.student);
    this.schoolService.updateStudent(this.student).subscribe(response=> console.log(response));
  }

}
