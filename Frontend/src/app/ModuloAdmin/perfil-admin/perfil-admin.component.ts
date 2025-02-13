import { Component, OnInit, ViewChild, ɵɵqueryRefresh } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../Servicios/login.service';
import { lastValueFrom } from 'rxjs';
import { ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Tab } from 'bootstrap';
import { UserServiceService } from '../../Servicios/API/user-service.service';
import { NotificationService } from '../../Servicios/notification-service.service';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css',
    "../../../assets/vendor/bootstrap-icons/bootstrap-icons.css"]
})
export class PerfilAdminComponent implements OnInit {
  user: any = {};

  editUser: any = {};
  nombre: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  renewPassword: string = '';
  
  showPassword: boolean = false;

  constructor(
    private authService:LoginService,
    private router:Router,
    private cdRef: ChangeDetectorRef,
    private serviciosUsuarios: UserServiceService,
    private notificationService: NotificationService,

  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ngAfterViewInit(): void {
    const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabElements.forEach(tab => {
      new Tab(tab);
    });
  }

  onTabChange(): void {
    setTimeout(() => {
      this.cdRef.detectChanges();
    });
  }

  ngOnInit(): void {
    this.loadUserData()
  }

  async loadUserData(): Promise<void> {
    this.user = await lastValueFrom(this.authService.getUser()); // 🔥 Convertimos el Observable en una Promise
    //console.log(this.user);
  }

  async loadEditUser(): Promise<void> {
    await this.loadUserData();
    this.editUser = { ...this.user }; // Hace una copia de los datos del usuario para editar
    this.nombre = this.editUser.usuario.nombre
  }

  async cambiarclave(): Promise<void> {
    this.currentPassword = '';
    this.newPassword = '';
    this.renewPassword = '';
  }  

  async GuardarCambiosPerfil(form: any) {
    if (form.valid) { 
      try {
        const { nombre, email } = form.value;  
        const edit = { nombre, email };
  
        //console.log({ ...edit, id_usuario: this.user.id_usuario });
  
        // Verifica que el servicio correcto sea llamado
        const data = await lastValueFrom(this.serviciosUsuarios.actualizarUsuario(this.user.usuario.id_usuario, edit));
  
        if (data?.message) {
          this.notificationService.showSuccess(data.message);
          window.location.reload();
        }
    
      } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        this.notificationService.showError("Error al actualizar el usuario. Intente nuevamente.");
      }
    } else {
      this.notificationService.showError("Formulario inválido. Verifique los campos.");
    }
  }


  CambioClave(form: any){
    if (form.valid) {

    }
  }

  

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  
}
