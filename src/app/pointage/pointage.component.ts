// src/app/pointage/pointage.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PointageService } from '../../Service/pointage.service';

@Component({
  selector: 'app-pointage',
  templateUrl: './pointage.component.html',
  styleUrls: ['./pointage.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})
export class PointageComponent implements OnInit, OnDestroy {

  currentDateTime: Date = new Date();
  private dateTimeInterval: any;

  personnelId: string = '';
  selectedDate: string = new Date().toISOString().slice(0, 10);

  timeEntries: any[] = [];

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  monthlyWorkHours: string = 'N/A';
  monthlyPersonnelId: string = '';

  constructor(
    private pointageService: PointageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dateTimeInterval = setInterval(() => {
        this.currentDateTime = new Date();
      }, 1000);
    }
    this.loadPointages();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.dateTimeInterval) {
      clearInterval(this.dateTimeInterval);
    }
  }

  loadPointages(): void {
    this.pointageService.getAllPointages().subscribe({
      next: (data) => {
        this.timeEntries = data;
        console.log('Pointages chargés :', this.timeEntries);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des pointages :', error);
        if (isPlatformBrowser(this.platformId)) {
          alert('Impossible de charger les pointages. Veuillez vérifier la console et la connexion au backend.');
        }
      }
    });
  }

  calculateMonthlyWorkHours(): void {
    const personnelId = this.monthlyPersonnelId.trim();
    if (!personnelId) {
      if (isPlatformBrowser(this.platformId)) {
        alert('Veuillez entrer l\'ID du personnel pour le calcul mensuel.');
      }
      return;
    }

    this.pointageService.getMonthlyWorkHours(personnelId, this.selectedYear, this.selectedMonth).subscribe({
      next: (response) => {
        this.monthlyWorkHours = response.total_string;
        console.log('Heures mensuelles calculées :', this.monthlyWorkHours);
      },
      error: (error) => {
        console.error('Erreur lors du calcul des heures mensuelles :', error);
        if (isPlatformBrowser(this.platformId)) {
          alert('Erreur lors du calcul des heures mensuelles. Veuillez vérifier la console.');
        }
        this.monthlyWorkHours = 'Erreur';
      }
    });
  }

  // Méthode principale pour gérer le scan d'un code-barres ou la saisie manuelle
  processBarcode(): void {
    const barcode = this.personnelId.trim();
    if (!barcode) {
      if (isPlatformBrowser(this.platformId)) {
        alert('Veuillez scanner ou saisir le code-barres.');
      }
      return;
    }

    this.pointageService.getPointageByPersonnelIdAndDate(barcode, this.selectedDate).subscribe({
      next: (existingPointage) => {
        if (existingPointage && existingPointage.heure_arrivee && !existingPointage.heure_depart) {
          // Un pointage existe avec une heure d'arrivée, mais pas de départ -> c'est un DÉPART
          this.pointerDepartAutomatique(barcode);
        } else if (existingPointage && existingPointage.heure_arrivee && existingPointage.heure_depart) {
          // Le pointage est déjà complet (arrivée et départ)
          if (isPlatformBrowser(this.platformId)) {
            alert(`Le personnel ${barcode} a déjà pointé son arrivée et son départ pour aujourd'hui.`);
          }
        } else {
          // Autre cas (erreur, données corrompues)
          console.error('Données de pointage existantes inattendues :', existingPointage);
          if (isPlatformBrowser(this.platformId)) {
            alert('Erreur: Données de pointage existantes inattendues.');
          }
        }
      },
      error: (error) => {
        if (error.status === 404) {
          // Aucun pointage trouvé pour aujourd'hui -> c'est une ARRIVÉE
          this.pointerArriveeAutomatique(barcode);
        } else {
          // Gérer d'autres erreurs éventuelles
          console.error('Erreur lors de la vérification du pointage existant :', error);
          if (isPlatformBrowser(this.platformId)) {
            alert('Erreur lors de la vérification du pointage. Veuillez consulter la console.');
          }
        }
      },
      complete: () => {
        this.personnelId = ''; // Vider le champ de saisie après le traitement
      }
    });
  }

  // Logique pour l'arrivée automatique
  pointerArriveeAutomatique(barcode: string): void {
    const pointageData = {
      personnel_id: barcode,
      date: this.selectedDate,
      heure_arrivee: this.currentDateTime.toTimeString().slice(0, 8)
    };
    this.pointageService.addPointage(pointageData).subscribe({
      next: (response) => {
        console.log('Pointage d\'arrivée automatique enregistré :', response);
        if (isPlatformBrowser(this.platformId)) {
          alert(`Arrivée de ${barcode} enregistrée à ${pointageData.heure_arrivee} le ${pointageData.date}.`);
        }
        this.loadPointages();
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement de l\'arrivée automatique :', error);
        if (isPlatformBrowser(this.platformId)) {
          if (error.status === 409) {
            alert('Ce personnel a déjà un pointage d\'arrivée pour cette journée. Pour un départ, scannez à nouveau.');
          } else {
            alert('Erreur lors de l\'enregistrement de l\'arrivée. Veuillez vérifier la console.');
          }
        }
      }
    });
  }

  // Logique pour le départ automatique
  pointerDepartAutomatique(barcode: string): void {
    const pointageData = {
      personnel_id: barcode,
      date: this.selectedDate,
      heure_depart: this.currentDateTime.toTimeString().slice(0, 8)
    };
    this.pointageService.updatePointageDepart(pointageData.personnel_id, pointageData.date, pointageData.heure_depart).subscribe({
      next: (response) => {
        console.log('Pointage de départ automatique enregistré :', response);
        if (isPlatformBrowser(this.platformId)) {
          alert(`Départ de ${barcode} enregistré à ${pointageData.heure_depart} le ${pointageData.date}.`);
        }
        this.loadPointages();
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement du départ automatique :', error);
        if (isPlatformBrowser(this.platformId)) {
          if (error.status === 404) {
            alert('Aucun pointage d\'arrivée trouvé pour ce personnel à cette date. Ce doit être une arrivée.');
          } else {
            alert('Erreur lors de l\'enregistrement du départ. Veuillez vérifier la console.');
          }
        }
      }
    });
  }

  // Fonctions pour les boutons manuels (si nécessaire)
  pointerArrivee(): void {
    if (!this.personnelId) {
      if (isPlatformBrowser(this.platformId)) alert('Veuillez entrer l\'ID du personnel.');
      return;
    }
    this.pointerArriveeAutomatique(this.personnelId);
  }

  pointerDepart(): void {
    if (!this.personnelId) {
      if (isPlatformBrowser(this.platformId)) alert('Veuillez entrer l\'ID du personnel.');
      return;
    }
    this.pointerDepartAutomatique(this.personnelId);
  }

  deletePointage(id: number): void {
    if (isPlatformBrowser(this.platformId) && confirm('Êtes-vous sûr de vouloir supprimer ce pointage ?')) {
      this.pointageService.deletePointage(id).subscribe({
        next: () => {
          if (isPlatformBrowser(this.platformId)) alert('Pointage supprimé avec succès.');
          this.loadPointages();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du pointage :', error);
          if (isPlatformBrowser(this.platformId)) alert('Erreur lors de la suppression du pointage. Veuillez vérifier la console.');
        }
      });
    }
  }

  formatTime(timeString: string | null): string {
    if (!timeString) return 'N/A';
    return timeString.slice(0, 5);
  }
}
