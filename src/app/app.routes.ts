import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PersonnelComponent } from './personnel/personnel.component';
import { PointageComponent } from './pointage/pointage.component';
import { AjouterComponent } from './ajouter/ajouter.component';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './Connection/login/login.component';
import { RegisterComponent } from './Connection/register/register.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent}, // Exemple de protection
  { path: 'personnel', component: PersonnelComponent}, // Exemple de protection
  { path: 'pointage', component: PointageComponent }, // Exemple de protection
  { path: 'ajouter', component: AjouterComponent}, // Exemple de protection
  { path: 'ajouter', component: AjouterComponent},
  { path: 'ajouter/id', component: AjouterComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
