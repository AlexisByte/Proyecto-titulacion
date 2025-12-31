import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Importa el guard

import { InicioportadaComponent } from './Template/inicioportada/inicioportada.component';
import { LoginComponent } from './Template/login/login.component';
import { RegisterComponent } from './Template/register/register.component';
import { RolesComponent } from './Template/roles/roles.component';
import { InicioAdminComponent } from './ModuloAdmin/inicio-admin/inicio-admin.component';
import { InicioGerenteComponent } from './ModuloGerente/inicio-gerente/inicio-gerente.component';
import { InicioVentanillaComponent } from './ModuloVentanilla/inicio-ventanilla/inicio-ventanilla.component';

const routes: Routes = [
  { path: '', component: InicioportadaComponent }, // Ruta predeterminada
  { path: 'login', component: LoginComponent }, // Ruta para LoginComponent
  { path: 'register', component: RegisterComponent }, // Ruta para LoginComponent

  { path: 'roles', component: RolesComponent, 
    canActivate: [AuthGuard] 
  }, // Ruta para LoginComponent

  { path: 'Administrador', component: InicioAdminComponent, 
    canActivate: [AuthGuard] , 
  }, // Ruta para LoginComponent

  { path: 'Gerente', component: InicioGerenteComponent, 
    canActivate: [AuthGuard] ,

  }, // Ruta para LoginComponent

  { path: 'Ventanilla', component: InicioVentanillaComponent , 
    canActivate: [AuthGuard],
  }, // Ruta para LoginComponent

  { path: '**', redirectTo: '' } // Redirigir rutas no encontradas a la raíz
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
