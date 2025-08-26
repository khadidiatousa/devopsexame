import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngFor
import { HttpClientModule } from '@angular/common/http'; // Needed if PersonnelService uses HttpClient, which it does
import { PersonnelService } from '../../Service/personnel.service'; // Import your service
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-personnel',
  templateUrl: './personnel.component.html',
  styleUrls: ['./personnel.component.css'], // Corrected from styleUrl to styleUrls (array)
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule] // Make sure these are imported
})
export class PersonnelComponent implements OnInit { // Implement OnInit

  personnels: any[] = []; // Property to hold the list of personnel

  constructor(private personnelService: PersonnelService) { }

  ngOnInit(): void {
    this.loadPersonnels(); // Load data when the component initializes
  } 

  loadPersonnels(): void {
    this.personnelService.getAllPersonnels().subscribe({
      next: (data) => {
        this.personnels = data; // Assign fetched data to the personnels array
        console.log('Personnels loaded:', this.personnels);
      },
      error: (error) => {
        console.error('Error loading personnels:', error);
        // Handle error, e.g., display a message to the user
        alert('Erreur lors du chargement des personnels. Veuillez consulter la console pour plus de détails.');
      }
    });
  }

  // Example: Delete functionality (assuming you'll add it to your service and backend)
  deletePersonnel(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce personnel ?')) {
      // Assuming a delete method in your service
       this.personnelService.deletePersonnel(id).subscribe({
        next: () => {
         console.log('Personnel supprimé avec succès');
           this.loadPersonnels(); // Reload the list after deletion
       },
        error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du personnel.');
       }
     });
    }
  }

  // Example: Edit functionality (assuming you'll navigate to an edit form)
  editPersonnel(id: number): void {
    // Implement navigation to an edit component, e.g.:
    // this.router.navigate(['/edit-personnel', id]);
    alert(`Fonctionnalité de modification pour l'ID ${id} à implémenter.`);
  }
}