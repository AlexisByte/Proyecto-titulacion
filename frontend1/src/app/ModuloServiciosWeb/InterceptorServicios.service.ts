import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { ServiciviosVarios } from "./ServiciosTestVarios.component";
import { SpinnerService } from "./spinner.service";
import { finalize, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  
  })
export class SpinnerInterceptor implements HttpInterceptor {
    constructor(private serviciosvarios: ServiciviosVarios,private spinnerService: SpinnerService) { }




  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinnerService.show(); // Mostrar spinner al inicio de la solicitud
    console.log("interceprtor")
    return next.handle(request).pipe(
      finalize(() => {
        this.spinnerService.hide(); // Ocultar spinner al finalizar la solicitud
      })
    );
  }
   /* intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let request = req;
      //  if (req.url.includes("rutareportes") || req.url.includes("rutaAcademico/getListados/") || req.url.includes("wstitulacion")) {
        if (req.url.includes("rutareportes")) {
         //   let token = this.serviciosWebSistema.getTokenKey();
            request = req.clone({
                setHeaders: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': 'Bearer ' + token
                }
            });
            return next.handle(request).pipe(
                finalize(() => this.procesar.cerrar()),
                catchError(err => {
                    //console.error('error cought in service', err);
                    this.procesar.abrirError();
                    return throwError(err);
                }));
        } else {
            // this.procesar.abrir();
            return next.handle(req).pipe(
                finalize(() =>
                    console.log('')
                ),
                catchError(err => {
                    console.error('error cought in service', err);
                    // this.procesar.abrirError();
                    return throwError(err);
                }));
        }
    }
    */



}