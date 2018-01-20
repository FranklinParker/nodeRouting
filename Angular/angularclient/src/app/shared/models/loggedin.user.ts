export class LoggedInUser {
  name: string;
  token: string;
  constructor(name:string, token:string){
    this.name = name;
    this.token = token;
  }
}
