import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
    private spinnerVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    spinnerVisible$ = this.spinnerVisibleSubject.asObservable();
  
    constructor() {}
  
    show(): void {
        console.log("Mostrar")
      this.spinnerVisibleSubject.next(true);
    }
  
    hide(): void {
        console.log("Ocultar")
      this.spinnerVisibleSubject.next(false);
    }
}