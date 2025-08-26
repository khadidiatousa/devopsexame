import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Nécessaire pour *ngIf
import { NavComponent } from './Navigations/nav/nav.component'; // Chemin ajusté si nécessaire
import { SidebarComponent } from './Navigations/sidebar/sidebar.component'; // Chemin ajusté si nécessaire

@Component({
  selector: 'app-root',
  standalone: true, // Important: Déclare ce composant comme autonome
  imports: [
    CommonModule, // Pour les directives structurelles comme *ngIf
    RouterOutlet, // Pour permettre au routeur d'afficher les composants des routes
    NavComponent, // Composant de navigation, utilisé directement dans le template
    SidebarComponent // Composant de barre latérale, utilisé directement dans le template
    // Les autres composants (DashboardComponent, PersonnelComponent, LoginComponent, RegisterComponent, etc.)
    // ne sont PAS importés ici car ils sont chargés dynamiquement via <router-outlet>
    // et définis dans votre configuration de routes (routes.ts).
  ],
  templateUrl: './app.component.html', // Le template est désormais dans un fichier séparé
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  // Cette variable contrôle la visibilité du layout de l'application (avec nav et sidebar)
  showAppLayout: boolean = false; // Par défaut, cache le layout de l'application

  constructor(private router: Router) {}

  ngOnInit(): void {
    // S'abonne aux événements de navigation pour détecter les changements de route
    this.router.events.subscribe(event => {
      // Si l'événement est la fin d'une navigation
      if (event instanceof NavigationEnd) {
        // Définit les routes qui sont considérées comme des pages d'authentification
        const authRoutes = ['/login', '/register'];
        // showAppLayout est vrai si la route actuelle N'EST PAS une route d'authentification
        this.showAppLayout = !authRoutes.includes(this.router.url);
         console.log('Current URL:', this.router.url);
        console.log('showAppLayout:', this.showAppLayout);
      }
    });
  }
}
