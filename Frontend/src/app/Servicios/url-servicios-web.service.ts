import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UrlServiciosWebService {
  urlServiciosTest = "http://localhost:5000";
  user: any;
  constructor(private http: HttpClient) {    
  }

  //Roles
  ListadoRoles() {
    return this.http.get<any[]>(this.urlServiciosTest + '/api/roles')
  }

}
