import { Routes } from '@angular/router';
import { InicioportadaComponent } from './Template/inicioportada/inicioportada.component';
import { LoginComponent } from './Template/login/login.component';
import { RegisterComponent } from './Template/register/register.component';

export const routes: Routes = [
  { path: '', component: InicioportadaComponent }, // Ruta raíz
  { path: 'login', component: LoginComponent }, // Ruta para LoginComponent
  { path: 'register', component: RegisterComponent }, // Ruta para LoginComponent




  { path: '**', redirectTo: '' }, // Redirigir rutas no encontradas a la raíz
];
