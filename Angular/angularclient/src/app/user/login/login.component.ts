import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  login(userLogin) {
    console.log('got userLogin', userLogin);
    this.userService.login(userLogin)
      .subscribe(result => console.log('login result', result));

  }

}
