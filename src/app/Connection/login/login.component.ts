import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../Service/auth.service';
import { Router, RouterEvent } from '@angular/router';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf,RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    console.log('loginForm:', this.loginForm);
    console.log('loginForm.controls:', this.loginForm.controls);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
          if (user) {
            console.log('Connexion réussie, utilisateur:', user);
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Erreur lors de la récupération des informations utilisateur.';
            console.error('Erreur lors de la récupération des informations utilisateur après la connexion.');
          }
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Identifiants invalides. Veuillez réessayer.';
          console.error('Erreur de connexion', error);
        }
      });
    }
  }
}