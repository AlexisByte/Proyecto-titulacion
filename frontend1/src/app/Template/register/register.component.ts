import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AppHttpService } from '../../Servicios/app-http.service';
import { HttpClientModule } from '@angular/common/http'; // Importa HttpClientModule


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterOutlet, FormsModule,HttpClientModule], // Agrega HttpClientModule aquí
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  remember: boolean = false;
  rol: number = 0;
  roles: any[] = []; // Lista de roles
  selectedRolName: string = ''; // Nombre del rol seleccionado

  //constructor(private serviciviosVarios: AppHttpService) {}

  async ngOnInit() {
    //this.loadRoles();
  }

  /*
  loadRoles(): void {
    this.serviciviosVarios.ListadoRoles().subscribe({
      next: (data) => {
        this.roles = data; // Asume que el servicio retorna un array de objetos [{ id: 1, name: 'Admin' }, ...]
        console.log(this.roles)
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
      }
    });
  }*/
  
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

  login(form: NgForm){
    
  }

}
