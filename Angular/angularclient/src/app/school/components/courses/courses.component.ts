import {Component, OnInit} from '@angular/core';
import {SchoolService} from "../../../shared/services/school.service";
import {Course} from "../../../shared/models/course";

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[];

  constructor(private schoolService: SchoolService) {

  }

  ngOnInit() {
    this.schoolService.getCourses().subscribe(
      (courses:Course[])=> {
        console.log('courses:', courses);
        this.courses = courses;
      }
    )
  }


}
