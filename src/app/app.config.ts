import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http'; // <-- Importez provideHttpClient et withFetch ici
import { routes } from './app.routes';
//import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthService } from '../Service/auth.service';
import { AuthInterceptor } from '../Interceptor/auth-interceptor.interceptor';
import { AuthGuard } from './auth.guard';
import { RouterModule } from '@angular/router';
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()), // <-- Utilisez provideHttpClient avec withFetch()
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthGuard, // Fournissez directement la fonction garde
    //provideClientHydration(withEventReplay()), // Si vous utilisez l'hydratation
    { provide: API_URL, useValue: 'https://api.PointageCEDDiamniadio.com' } 
  ],
};