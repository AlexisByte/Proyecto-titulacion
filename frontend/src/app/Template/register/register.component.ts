import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { UrlServiciosWebService } from '../../Servicios/url-servicios-web.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  remember: boolean = false;
  rol: number = 0;
  roles: any[] = []; // Lista de roles
  selectedRolName: string = ''; // Nombre del rol seleccionado

  constructor(private urlServiciosWebService: UrlServiciosWebService) {}

  async ngOnInit() {
    this.loadRoles();
  }

  
  loadRoles() {
    this.urlServiciosWebService.ListadoRoles().subscribe(
      (data) => {
        this.roles = data; // Asigna los roles al arreglo
      },
      (error) => {
        console.error('Error al cargar los roles:', error);
      }
    );
  }
  
  addFormValidation() {
    document.addEventListener('DOMContentLoaded', function() {
      var forms = document.querySelectorAll('.needs-validation');
      
      Array.prototype.slice.call(forms)
        .forEach(function(form) {
          form.addEventListener('submit', function(event: Event) {
            if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();
            }
    
            form.classList.add('was-validated');
          }, false);
        });
    });
  }

  Register(form: any) {
    if (form.valid) {
      console.log('Formulario válido:', form.value);
      // Lógica para enviar los datos del formulario
    } else {
      console.error('Formulario inválido');
    }
  }

}