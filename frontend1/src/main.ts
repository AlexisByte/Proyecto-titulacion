/* main.ts */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { RegisterComponent } from './app/Template/register/register.component';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(RegisterComponent, {
  providers: [provideHttpClient(),AppComponent] // Proporciona HttpClient globalmente
}).catch(err => console.error(err));