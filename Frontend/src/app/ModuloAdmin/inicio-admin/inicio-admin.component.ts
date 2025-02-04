import { LoginService } from '../../Servicios/login.service';
import { Router } from '@angular/router';
import { Component, OnInit,HostListener} from '@angular/core';
import { NotificationService } from '../../Servicios/notification-service.service';

@Component({
  selector: 'app-inicio-admin',
  templateUrl: './inicio-admin.component.html',
  styleUrls: ['./inicio-admin.component.css',
  "../../../assets/vendor/bootstrap-icons/bootstrap-icons.css"]
})
export class InicioAdminComponent  implements OnInit{

  seccion: string = '1';
  activeMenu: string = ''; // Variable para rastrear el menú activo
  activeSection: string = ''; // Variable para rastrear la sección activa
  collapsed: boolean = true; // O `false` según tu estado inicial

  user: any = {};
  dato: any = {};

  sidebarCollapsed = false;

  constructor(
    public  authService: LoginService, 
    private router: Router,
    private notificationService: NotificationService, // Inyecta el servicio MatSnackBar

  ) {}

  ngOnInit(): void {
    this.dato = this.authService.getUser(); // Obtiene la información del usuario al inicializar el componente
    this.collapsed = !this.collapsed;

  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  menus: { [key: string]: boolean } = {};  

  toggleMenu(menu: string, event: Event) {
    this.menus[menu] = !this.menus[menu];
    event.stopPropagation();
  }
  private setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }
  private setActiveSection(section: string) {
    this.activeSection = section;
  }
  logout() {
    this.authService.logout().subscribe(response => {
      this.notificationService.showSuccess(response.message);
      console.log(response.message); // Puedes usar un servicio de notificación aquí
      this.router.navigate(['/']);

    });    
  }
  SeccionPanelPrincipal(event: Event) {
    this.setActiveMenu('dashboard'); // Marca el menú "Panel Principal" como activo
    this.setActiveSection(''); // Limpia la sección activa
    event.preventDefault();
    this.seccion = '1';
  }
  SeccionUsuarios(event: Event){
    event.preventDefault();
    this.seccion = '2';
    this.setActiveSection('Usuarios');
    this.setActiveMenu(''); 
  }

  
  SeccionPerfil(event: Event) {
    event.preventDefault();
    this.setActiveMenu('profile'); // Marca el menú "Perfil" como activo
    this.setActiveSection(''); // Limpia la sección activa
    this.collapsed = true; // Colapsa la sección de gestión
    this.seccion = '8';
  }
}

