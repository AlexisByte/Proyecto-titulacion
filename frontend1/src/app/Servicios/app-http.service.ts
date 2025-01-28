import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppHttpService {
  urlServicio:String="http://localhost:5000";
  ;
  user: any;
  constructor(private http: HttpClient, private hpptclient: HttpClient) {
    
  }

  //Roles
  ListadoRoles() {
    return this.http.get<any[]>(this.urlServicio + '/api/roles')
  }

}
