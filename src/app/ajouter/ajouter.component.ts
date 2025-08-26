import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import JsBarcode from 'jsbarcode';
import { PersonnelService } from '../../Service/personnel.service';
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute et Router

@Component({
  selector: 'app-ajouter',
  templateUrl: './ajouter.component.html',
  styleUrls: ['./ajouter.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class AjouterComponent implements OnInit, AfterViewInit {

  personnel = {
    id: '', // Correspond au champ 'barcode' dans votre backend
    nom: '',
    prenom: '',
    adresse: '',
    telephone: '',
    service: '',
    photo_url: ''
  };

  private idCounter: number = 0;
  // Déclarez currentPersonnelId pour suivre si on est en mode édition
  currentPersonnelId: number | null = null; // Pour stocker l'ID du personnel en cours d'édition

  @ViewChild('barcodeSvg') barcodeSvg!: ElementRef;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private personnelService: PersonnelService,
    private route: ActivatedRoute, // Injectez ActivatedRoute
    private router: Router // Injectez Router pour la navigation
  ) { }

  ngOnInit(): void {
    // Vérifie si un ID est passé dans l'URL (mode édition)
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id'); // 'id' est le nom du paramètre dans la route
      if (idParam) {
        this.currentPersonnelId = +idParam; // Convertir en nombre
        this.loadPersonnelForEdit(this.currentPersonnelId); // Charger les données pour l'édition
      } else {
        // Mode ajout : charge le compteur pour un nouvel ID
        this.loadInitialIdCounter();
      }
    });
  }

  ngAfterViewInit(): void {
    // Le code-barres ne sera rendu que si personnel.id est défini.
    // En mode édition, il sera défini après loadPersonnelForEdit.
    // En mode ajout, il sera défini après generateStructuredId.
    this.renderBarcode();
  }

  loadPersonnelForEdit(id: number): void {
    this.personnelService.getPersonnel(id).subscribe({
      next: (data) => {
        // Remplir le formulaire avec les données du personnel existant
        this.personnel.id = data.barcode; // Utilise le code-barres comme 'id' affiché
        this.personnel.nom = data.nom;
        this.personnel.prenom = data.prenom;
        this.personnel.adresse = data.adresse;
        this.personnel.telephone = data.telephone;
        this.personnel.service = data.service;
        this.personnel.photo_url = data.photo_url; // Afficher l'image existante
        this.previewUrl = data.photo_url; // Initialiser la prévisualisation

        this.renderBarcode(); // Rendre le code-barres pour le personnel existant
      },
      error: (error) => {
        console.error('Erreur lors du chargement du personnel pour modification :', error);
        alert('Erreur lors du chargement des données du personnel.');
        this.router.navigate(['/personnels']); // Rediriger en cas d'erreur
      }
    });
  }

  loadInitialIdCounter(): void {
    this.personnelService.getAllPersonnels().subscribe({
      next: (personnels) => {
        let maxIdNum = 0;
        personnels.forEach((p: any) => {
          // Ajusté pour rechercher n'importe quel nombre après le préfixe 'DTS-DIAMN...-'
          if (p.barcode && p.barcode.startsWith('DTS-DIAMN')) {
            const parts = p.barcode.split('-');
            const numStr = parts[parts.length - 1]; // Obtenir la dernière partie (ex: "001")
            const num = parseInt(numStr, 10);
            if (!isNaN(num) && num > maxIdNum) {
              maxIdNum = num;
            }
          }
        });
        this.idCounter = maxIdNum; // Initialise le compteur au maximum existant
        this.generateStructuredId(); // Génère le premier nouvel ID
      },
      error: (error) => {
        console.error('Erreur lors du chargement des personnels pour initialiser le compteur:', error);
        this.idCounter = 0;
        this.generateStructuredId();
      }
    });
  }

  generateStructuredId(): void {
    // Génère un nouvel ID structuré uniquement si on est en mode ajout
    if (this.currentPersonnelId === null) {
      const nomPart = this.personnel.nom ? this.personnel.nom.split(' ')[0] : '';
      const servicePart = this.personnel.service ? this.personnel.service : '';

      // Incrémenter le compteur uniquement pour la génération d'un nouvel ID
      this.idCounter++;
      const paddedCounter = this.idCounter.toString().padStart(3, '0');

      this.personnel.id = `DTS-DIAMN${nomPart}-${servicePart}-${paddedCounter}`;
    }

    if (this.barcodeSvg) {
      this.renderBarcode();
    }
  }

  onPersonalDetailsChange(): void {
    // Génère l'ID dynamiquement uniquement en mode ajout
    if (this.currentPersonnelId === null) {
      this.generateStructuredId();
    }
  }

  renderBarcode(): void {
    if (this.barcodeSvg && this.personnel.id) {
      JsBarcode(this.barcodeSvg.nativeElement, this.personnel.id, {
        format: "CODE128",
        displayValue: true,
        height: 30,
        width: 1,
        lineColor: "#000",
        textMargin: 3,
        fontSize: 12
      });
    }
  }

  downloadBarcode(): void {
    if (this.barcodeSvg && this.personnel.id) {
      const svgElement = this.barcodeSvg.nativeElement;
      const svgData = new XMLSerializer().serializeToString(svgElement);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `codebarre_${this.personnel.id}.png`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } else {
      console.warn("Impossible de télécharger le code-barres : L'ID ou l'élément SVG est manquant.");
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.previewFile();
    } else {
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  previewFile(): void {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.previewUrl = null;
    }
  }

  onSubmit(): void {
    const dataToSend = {
      nom: this.personnel.nom,
      prenom: this.personnel.prenom,
      adresse: this.personnel.adresse,
      telephone: this.personnel.telephone,
      service: this.personnel.service,
      barcode: this.personnel.id, // Ce sera l'ID généré pour l'ajout, ou l'ID existant pour l'édition
      photo_url: this.previewUrl
    };

    console.log('Données envoyées au backend:', dataToSend);

    if (this.currentPersonnelId) {
      // Mode modification : Utilisez updatePersonnel et passez l'ID
      this.personnelService.updatePersonnel(this.currentPersonnelId, dataToSend).subscribe({
        next: (response) => {
          console.log('Personnel mis à jour avec succès:', response);
          alert('Personnel mis à jour avec succès !');
          this.router.navigate(['/personnels']); // Rediriger vers la liste après la mise à jour
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du personnel:', error);
          if (error.status === 422 && error.error && error.error.errors) {
            let errorMessage = 'Veuillez corriger les erreurs suivantes :\n';
            for (const key in error.error.errors) {
              if (error.error.errors.hasOwnProperty(key)) {
                errorMessage += `- ${error.error.errors[key].join(', ')}\n`;
              }
            }
            alert(errorMessage);
          } else {
            alert('Une erreur inattendue est survenue lors de la mise à jour du personnel. Veuillez vérifier la console.');
          }
        }
      });
    } else {
      // Mode ajout : Utilisez addPersonnel
      this.personnelService.addPersonnel(dataToSend).subscribe({
        next: (response) => {
          console.log('Personnel ajouté avec succès:', response);
          alert('Personnel ajouté avec succès !');
          this.resetForm();
          this.router.navigate(['/personnels']); // Rediriger vers la liste après l'ajout
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du personnel:', error);
          if (error.status === 422 && error.error && error.error.errors) {
            console.error('Détails des erreurs de validation:', error.error.errors);
            let errorMessage = 'Veuillez corriger les erreurs suivantes :\n';
            for (const key in error.error.errors) {
              if (error.error.errors.hasOwnProperty(key)) {
                errorMessage += `- ${error.error.errors[key].join(', ')}\n`;
              }
            }
            alert(errorMessage);
          } else {
            alert('Une erreur inattendue est survenue lors de l\'ajout du personnel. Veuillez vérifier la console.');
          }
        }
      });
    }
  }

  resetForm(): void {
    this.personnel = {
      id: '',
      nom: '',
      prenom: '',
      adresse: '',
      telephone: '',
      service: '',
      photo_url: ''
    };
    this.currentPersonnelId = null; // Réinitialiser l'ID d'édition
    this.loadInitialIdCounter();
    this.selectedFile = null;
    this.previewUrl = null;
  }
}
