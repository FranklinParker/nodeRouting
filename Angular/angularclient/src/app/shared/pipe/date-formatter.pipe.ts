import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
@Pipe({
  name: 'dateFormatter'
})
export class DateFormatterPipe extends DatePipe implements PipeTransform {

  transform(value: Date, args?: any): any {
     return super.transform(value, 'MM/dd/yyyy HH:mm:ss');
  }

}
