import { Component } from '@angular/core';
import { NotificationService } from '../../Servicios/notification-service.service';
import { LoginService } from '../../Servicios/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private loginService: LoginService,
    private notificationService: NotificationService, // Inyecta el servicio MatSnackBar
    private router: Router  // Inyectamos Router
 
    ) {}

    Login(form: any) {
      if (form.valid) {
        const { email, password } = form.value;  
  
        this.loginService.login(email, password).subscribe({
          next: (response) => {
            console.log("Response Login:", response);
            this.notificationService.showSuccess(response.message);
  
            if (response.roles && response.roles.length > 0) {
              if (response.roles.length === 1) {
                const roleName = response.roles[0].nombre_rol; // Obtener nombre del rol
                console.log("Nombre rol:", roleName);
                this.router.navigate([roleName]); // Redirigir a la ruta del rol
              } else {
                this.router.navigate(['roles']); // Si tiene más de un rol, ir a selección de roles
              }
            } else {
              this.router.navigate(['roles']); // Si no tiene roles, ir a selección de roles
            }
          },
          error: (error) => {
            console.log("Error en login:", error.message);
            this.notificationService.showError(error.message);
          }
        });
      } else {
        this.notificationService.showError('Por favor, completa todos los campos correctamente.');
      }
    }

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  }


