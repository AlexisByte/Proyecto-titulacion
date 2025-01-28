import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioportadaComponent } from './template/inicioportada/inicioportada.component';
import { LoginComponent } from './template/login/login.component';
import { RegisterComponent } from './template/register/register.component';

const routes: Routes = [
  { path: '', component: InicioportadaComponent }, // Ruta predeterminada
  { path: 'login', component: LoginComponent }, // Ruta para LoginComponent
  { path: 'register', component: RegisterComponent }, // Ruta para LoginComponent
  

  { path: '**', redirectTo: '' } // Redirigir rutas no encontradas a la raíz
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
