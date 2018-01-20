import { Pipe, PipeTransform } from '@angular/core';
import {Employee} from '../models/Employee';

@Pipe({
  name: 'employeeName'
})
export class EmployeeNamePipe implements PipeTransform {

  transform(employee: Employee, args?: any): any {
    return employee.firstName + ' ' + employee.lastName + ' has a salary of ' + employee.salary;
  }

}
