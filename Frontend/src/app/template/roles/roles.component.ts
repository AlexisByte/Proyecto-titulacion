import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../Servicios/login.service';
import { NotificationService } from '../../Servicios/notification-service.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  userName: string = '';  // Variable para el nombre del usuario
  userRoles: any = ''; // Variable para los roles del usuario
  
constructor(
    private loginservice: LoginService, 
    private notificationService: NotificationService, // Inyecta el servicio MatSnackBar

    ) {}
  ngOnInit(): void {
    // Recuperar el usuario del localStorage
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    
    console.log('Usuario:', user);
    console.log('Roles:', roles);
    if (user && roles) {
      this.userName = user.nombre; // Ajusta según la estructura de tu backend
      this.userRoles = roles; // Suponiendo que el usuario tiene una propiedad 'roles'
    }
  }

  logout(){
    this.loginservice.logout().subscribe(response => {
      this.notificationService.showSuccess(response.message);
      console.log(response.message); // Puedes usar un servicio de notificación aquí
    });    
  }

}
