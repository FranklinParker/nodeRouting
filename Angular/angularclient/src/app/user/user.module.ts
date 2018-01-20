import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import {AngularMaterialModule} from "../angular-material/angular-material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";



@NgModule({
  imports: [
    CommonModule,
    AngularMaterialModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  declarations: [LoginComponent],
  exports: [LoginComponent]
})
export class UserModule { }
