import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../Service/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.controls['password'].value;
    const confirmPassword = group.controls['password_confirmation'].value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
     this.authService.register(this.registerForm.value).subscribe({
  next: (response) => {
    console.log('Inscription réussie:', response);
    this.router.navigate(['/dashboard']);
  },
  error: (error) => {
    // Affiche le message d'erreur général
    this.errorMessage = error.message || 'L\'inscription a échoué. Veuillez réessayer.';
    console.error('Erreur d\'inscription complète:', error); // Log l'objet d'erreur complet
    
    // Si des erreurs de validation de Laravel sont présentes (status 422)
    if (error.status === 422 && error.error && error.error.errors) {
      console.error('Détails des erreurs de validation Laravel:', error.error.errors);
      let laravelErrors = '';
      for (const field in error.error.errors) {
        if (error.error.errors.hasOwnProperty(field)) {
          laravelErrors += `${field}: ${error.error.errors[field].join(', ')}\n`;
        }
      }
      // Vous pouvez choisir d'afficher ces messages spécifiques à l'utilisateur
      this.errorMessage = 'Erreurs de validation: \n' + laravelErrors;
    }
  },
});
    }
  }
}