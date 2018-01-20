import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SchoolService} from './services/school.service';
import {UserService} from './services/user.service';

import {HighlightDirective} from './highlight.directive';
import {EmployeeNamePipe} from './pipe/employee-name.pipe';
import {CapitializePipe} from './pipe/capitialize.pipe';
import {DateFormatterPipe} from './pipe/date-formatter.pipe';
import {HttpClientModule} from '@angular/common/http';

import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NavBarComponent} from './components/nav-bar/nav-bar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {AngularMaterialModule} from "../angular-material/angular-material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule.forChild([]),
    AngularMaterialModule
  ],
  declarations: [
    HighlightDirective,
    DateFormatterPipe,
    CapitializePipe,
    EmployeeNamePipe,
    NavBarComponent
  ],
  providers: [
    SchoolService,
    UserService
  ],
  exports: [
    HighlightDirective,
    DateFormatterPipe,
    CapitializePipe,
    EmployeeNamePipe,
    NavBarComponent

  ]
})
export class SharedModule {
}
