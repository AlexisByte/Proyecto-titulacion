import { Component, OnInit, ViewChild, ɵɵqueryRefresh } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../Servicios/login.service';
import { from, lastValueFrom } from 'rxjs';
import { ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Tab } from 'bootstrap';
import { UserServiceService } from '../../Servicios/API/user-service.service';
import { NotificationService } from '../../Servicios/notification-service.service';

@Component({
  selector: 'app-perfil-gerente',
  templateUrl: './perfil-gerente.component.html',
  styleUrls: ['./perfil-gerente.component.css',
    "../../../assets/vendor/bootstrap-icons/bootstrap-icons.css"]
})
export class PerfilGerenteComponent implements OnInit{
  user: any = { usuario: {} }; // Evita errores de acceso a propiedades
  email:string = '';
  editUser: any = {};
  nombre: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  renewPassword: string = '';
  
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showRenewPassword: boolean = false;
  
  constructor(
    private authService:LoginService,
    private router:Router,
    private cdRef: ChangeDetectorRef,
    private serviciosUsuarios: UserServiceService,
    private notificationService: NotificationService,

  ) {}

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'renew':
        this.showRenewPassword = !this.showRenewPassword;
        break;
    }
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
    try {
      this.user = await lastValueFrom(this.authService.getUser());
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      this.user = { usuario: {} }; // En caso de error, evita que sea undefined
    }
    //console.log(this.user);
  }

  async loadEditUser(): Promise<void> {
    await this.loadUserData();
    this.editUser = { ...this.user }; // Hace una copia de los datos del usuario para editar
    this.nombre = this.editUser.usuario.nombre
    this.email = this.editUser.usuario.email
  }

  async cambiarclave(): Promise<void> {
    this.currentPassword = '';
    this.newPassword = '';
    this.renewPassword = '';
    await this.loadUserData();
    this.editUser = { ...this.user };
    this.email = this.editUser.usuario.email
  }  

  async GuardarCambiosPerfil(form: any) {
    if (form.valid) { 
      try {
        if(this.nombre == this.editUser.usuario.nombre){
          this.notificationService.showError("Realice algun cambio para guardar");
          return
        }
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


  CambioClave(form1: any) {
    if (form1.valid) {
      //console.log("Valores del formulario:", form1.value);
      //console.log("Valores enlazados:", this.currentPassword, this.newPassword, this.renewPassword);
  
      const { currentPassword, newPassword, renewPassword } = form1.value;
  
      // Validar que las contraseñas coincidan
      if (newPassword == currentPassword) {
        this.notificationService.showError("La contraseña nueva debe ser distinta a la anterior");
        //console.log("Valores enlazadosR:", this.currentPassword, this.newPassword, this.renewPassword);
        return;
      }
      //console.log("Valores enlazadosE:", this.email+currentPassword+newPassword);

      this.authService.CambiarContrasena(this.email,currentPassword,newPassword).subscribe({
        next: (response) => {
          console.log("Response CambioClave:", response);
          this.notificationService.showSuccess(response.message);
          this.logout();
        },
        error: (error) => {
          console.log("Error en CambioClave:", error.message);
          this.notificationService.showError(error.error?.message || "Error al cambiar la contraseña.");
        }
      });
    } else {
      this.notificationService.showError("Por favor, completa todos los campos correctamente.");
    }
  }
  

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
