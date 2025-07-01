import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from '../Servicios/login.service';

@Injectable({
  providedIn: 'root'
})
export class UrlServiciosWebService {
  urlServiciosTest = "http://localhost:5000";
  user: any;
  constructor(
    private http: HttpClient,
    private auth: LoginService,

  ) {   
  }

}
