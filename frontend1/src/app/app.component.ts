import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule], // Importa correctamente el componente
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Cambia styleUrl a styleUrls si es necesario
})
export class AppComponent {
  title = 'frontend';
}
