import {NgModule} from '@angular/core';

import {AngularMaterialModule} from "./angular-material/angular-material.module";
import { BrowserModule } from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {CommonModule} from '@angular/common';
import {routing} from './app.routing';
import {SchoolModule} from './school/school.module';
import {UserModule} from './user/user.module';
import {SharedModule} from './shared/shared.module';
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    CommonModule,
    SchoolModule,
    SharedModule,
    AngularMaterialModule,
    BrowserModule,
    FormsModule,
    routing,
    UserModule
  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
