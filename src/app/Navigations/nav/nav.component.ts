// src/app/Navigations/nav/nav.component.ts

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Assurez-vous d'importer RouterLink si vous avez des liens de routeur dans votre nav.component.html

// IMPORTANT : Vérifiez le chemin d'importation de LiveClockComponent.
// Si nav.component.ts est dans 'src/app/Navigations/nav/'
// et live-clock.component.ts est dans 'src/app/live-clock/',
// alors le chemin '../../live-clock/live-clock.component' est correct.

@Component({
  selector: 'app-nav',
  standalone: true, // Le composant Nav est un composant autonome
  imports: [
    RouterLink, // Incluez RouterLink si votre HTML utilise des routerLink
  ],
  templateUrl: './nav.component.html', // Le chemin vers le fichier HTML du template
  styleUrl: './nav.component.css' // Le chemin vers le fichier CSS des styles
})
export class NavComponent {
  // Aucune logique spécifique pour l'heure n'est nécessaire ici,
  // car le LiveClockComponent gère cela lui-même.
}
