import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentsListComponent} from './student/students-list/students-list.component';
import {StudentHomeComponent} from './student/student-home/student-home.component';
import {StudentViewComponent} from './student/student-view/student-view.component';
import {CoursesComponent} from './components/courses/courses.component';
import {FormsModule} from "@angular/forms";
import {AngularMaterialModule} from "../angular-material/angular-material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AngularMaterialModule,
    BrowserAnimationsModule


  ],
  declarations: [StudentsListComponent, StudentHomeComponent, StudentViewComponent, CoursesComponent],
  exports: [StudentHomeComponent,
    CoursesComponent
  ]

})
export class SchoolModule {
}
