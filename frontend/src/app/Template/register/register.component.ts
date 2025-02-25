import { FormsModule, NgForm } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { NotificationService } from '../../Servicios/notification-service.service';
import { RolesService } from '../../Servicios/API/roles.service';
import { UserServiceService } from '../../Servicios/API/user-service.service';
import { lastValueFrom } from 'rxjs';
import { LoginService } from '../../Servicios/login.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  nombre:string="";
  email:string = '';
  contrasena:string = '';
  roles: any[] = [];
  rol: number = 0; // Cambia 0 por ""

  termsAccepted: boolean = false; // Inicializar en falso
  showPassword: boolean = false;

  constructor(
    private urlServiciosWebService: RolesService,
    private serviciosUsuarios: UserServiceService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit() {
    this.loadRoles();
  }

  
  loadRoles() {
    this.urlServiciosWebService.obtenerRoles().subscribe(
      (data) => {
        this.roles = data; // Asigna los roles al arreglo
      },
      (error) => {
        console.error('Error al cargar los roles:', error);
      }
    );
  }
  

  async Register(form: any) {
    if (form.valid) {   
      //console.log('Formulario válido:', form.value);
      try {
        const { nombre, email, contrasena, rol } = form.value;
        const nuevo = { nombre, email, contrasena, rol };
        //console.log('Formulario válido:', nuevo);
        const data = await lastValueFrom(this.serviciosUsuarios.agregarUsuario(nuevo));
  
        if (data?.message) {
          this.notificationService.showSuccess(data.message);
        }
      } catch (error) {
        console.error("Error al crear el usuario:", error);
        this.notificationService.showError("Error al crear el usuario. Intente nuevamente.");
      }
    } else {
      //console.log('Formulario inválido:', form.value);
      this.notificationService.showError("Ingrese todos los campos. Intente nuevamente.");
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
}