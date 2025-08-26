import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PersonnelService } from '../../Service/personnel.service';
import { PointageService } from '../../Service/pointage.service';
import { forkJoin, Subscription, interval } from 'rxjs';
import { Chart, registerables } from 'chart.js';

// Enregistrer les composants de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Données de base
  totalPersonnel: number = 0;
  personnelPresent: number = 0;
  personnelAbsent: number = 0;
  tauxPresence: number = 0;

  // Instances des graphiques
  private presenceChart: Chart | undefined;
  private donutChart: Chart | undefined;

  // État de l'UI et abonnement
  isLoading: boolean = false;
  message: string = '';
  private refreshSubscription!: Subscription;

  constructor(
    private personnelService: PersonnelService,
    private pointageService: PointageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.chargerDonneesEtDessiner();

      // Mettre en place un rafraîchissement automatique
      this.refreshSubscription = interval(60000).subscribe(() => {
        this.chargerDonneesEtDessiner();
        this.message = `Données mises à jour à ${new Date().toLocaleTimeString()}.`;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.presenceChart) {
      this.presenceChart.destroy();
    }
    if (this.donutChart) {
      this.donutChart.destroy();
    }
  }

  chargerDonneesEtDessiner() {
    this.isLoading = true;
    this.message = '';

    forkJoin({
      allPersonnels: this.personnelService.getAllPersonnels(),
      allPointages: this.pointageService.getAllPointages()
    }).subscribe({
      next: (data) => {
        this.totalPersonnel = data.allPersonnels.length;

        const today = new Date().toISOString().slice(0, 10);
        const presentToday = new Set<string>();

        data.allPointages.forEach(pointage => {
          if (pointage.date === today && pointage.heure_arrivee) {
            presentToday.add(pointage.personnel_id);
          }
        });

        this.personnelPresent = presentToday.size;
        this.personnelAbsent = this.totalPersonnel - this.personnelPresent;
        this.tauxPresence = this.totalPersonnel > 0 ? Math.round((this.personnelPresent / this.totalPersonnel) * 100) : 0;

        this.fetchHistoricalData();
        this.drawDonutChart(this.tauxPresence);

        this.isLoading = false;
        this.message = `Données chargées avec succès.`;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données :', error);
        this.isLoading = false;
        this.message = 'Impossible de charger les données.';
      }
    });
  }

  fetchHistoricalData() {
    const historicalData = [
      { date: 'J-6', presenceRate: 85 },
      { date: 'J-5', presenceRate: 88 },
      { date: 'J-4', presenceRate: 92 },
      { date: 'J-3', presenceRate: 95 },
      { date: 'J-2', presenceRate: 90 },
      { date: 'J-1', presenceRate: 87 },
      { date: 'Aujourd\'hui', presenceRate: this.tauxPresence },
    ];

    const labels = historicalData.map(d => d.date);
    const data = historicalData.map(d => d.presenceRate);
    this.drawBarChart(labels, data);
  }

  drawBarChart(labels: string[], data: number[]) {
    if (this.presenceChart) {
      this.presenceChart.destroy();
    }
    const ctx = (document.getElementById('presenceChart') as HTMLCanvasElement)?.getContext('2d');
    if (ctx) {
      this.presenceChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Taux de présence (%)',
            data: data,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { callback: (value) => value + '%' }
            }
          }
        }
      });
    }
  }

  drawDonutChart(taux: number) {
    if (this.donutChart) {
      this.donutChart.destroy();
    }
    const ctx = (document.getElementById('donutChart') as HTMLCanvasElement)?.getContext('2d');
    if (ctx) {
      this.donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Présents', 'Absents'],
          datasets: [{
            data: [taux, 100 - taux],
            backgroundColor: ['#2563eb', '#d1d5db'],
            hoverBackgroundColor: ['#1d4ed8', '#9ca3af']
          }]
        },
        options: {
          responsive: true,
          cutout: '75%',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  /**
   * @description Déclenche le téléchargement d'un rapport PDF ou Excel sur la machine de l'utilisateur.
   * @param format Le format du rapport.
   */
  telechargerRapport(format: 'pdf' | 'excel'): void {
    this.message = `Génération du rapport de présence au format ${format.toUpperCase()} en cours...`;
    this.isLoading = true;

    this.pointageService.downloadReport(format).subscribe({
      next: (blob: Blob) => {
        // Crée une URL temporaire pour le Blob
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        // Définit le nom du fichier à télécharger
        a.download = `rapport_presence_${new Date().toISOString().slice(0, 10)}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url); // Libère la mémoire
        a.remove(); // Supprime l'élément 'a' du DOM

        this.message = `Rapport ${format.toUpperCase()} téléchargé avec succès !`;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du rapport :', err);
        this.message = `Erreur lors du téléchargement du rapport ${format.toUpperCase()}.`;
        this.isLoading = false;
      }
    });
  }
}
