import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './Servicio.Auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      const userType = this.authService.getUser();
      const expectedUse = route.data['expectedUserType'];
      //console.log(userType.tipousuario+"-/*/////"+expectedUse)

      if (userType.tipousuario == expectedUse) {
        return true;
      } else {
        this.router.navigate(['']);
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
