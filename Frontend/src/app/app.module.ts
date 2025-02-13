import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Importa FormsModule aquí
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
// IMPORTA ESTOS MÓDULOS DE PRIMENG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './template/login/login.component';
import { RegisterComponent } from './template/register/register.component';
import { InicioportadaComponent } from './template/inicioportada/inicioportada.component';
import { RolesComponent } from './template/roles/roles.component';
import { InicioAdminComponent } from './ModuloAdmin/inicio-admin/inicio-admin.component';
import { InicioGerenteComponent } from './ModuloGerente/inicio-gerente/inicio-gerente.component';
import { InicioVentanillaComponent } from './ModuloVentanilla/inicio-ventanilla/inicio-ventanilla.component';
import { GesUsuariosComponent } from './ModuloAdmin/ges-usuarios/ges-usuarios.component';
import { GesRolesComponent } from './ModuloAdmin/ges-roles/ges-roles.component';
import { GesModelosComponent } from './ModuloAdmin/ges-modelos/ges-modelos.component';
import { GesReglasNegocioComponent } from './ModuloAdmin/ges-reglas-negocio/ges-reglas-negocio.component';
import { PerfilAdminComponent } from './ModuloAdmin/perfil-admin/perfil-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioportadaComponent,
    LoginComponent,
    RegisterComponent,
    RolesComponent,
    InicioAdminComponent,
    InicioGerenteComponent,
    InicioVentanillaComponent,
    GesUsuariosComponent,
    GesRolesComponent,
    GesModelosComponent,
    GesReglasNegocioComponent,
    PerfilAdminComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,

    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    TagModule
  ],
  exports:[
    GesUsuariosComponent,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
