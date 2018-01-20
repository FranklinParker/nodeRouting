import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { LoggedInUser} from '../models/loggedin.user';



@Injectable()
export class UserService {
  userUrl = environment.userUrl;
  user:LoggedInUser;

  constructor(private http: HttpClient) { }


  login(userLogin): Observable<any> {
     return this.http.post(this.userUrl + 'login', userLogin )
      .map((response: Response) => {
        console.log('login response', response);
        if(response['result']==='success' ){
           this.user = new LoggedInUser(response['name'], response['token']);
           return this.user;
        }
        this.user = null;
        return response;
      });

  }


}
