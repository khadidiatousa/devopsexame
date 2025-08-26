import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_URL } from '../app/app.config';

interface AuthResponse {
  access_token?: string;
  token_type?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/users'; // Ajustez si nécessaire
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getInitialUser());
  public currentUser = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private platformId: Object
  ) {}

  private getInitialUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      return this.getUserFromLocalStorage();
    }
    return null;
  }

  get token(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  register(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap((response) => this.setToken(response)),
      tap(() => this.fetchCurrentUser())
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.setToken(response)),
      tap(() => this.fetchCurrentUser())
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.removeToken()),
      tap(() => this.currentUserSubject.next(null))
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`);
  }

  private fetchCurrentUser(): void {
    if (this.token) {
      this.getCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.removeToken(), // En cas d'erreur (token invalide par ex.)
      });
    }
  }

  private setToken(response: AuthResponse | undefined): void {
    if (response?.access_token && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, response.access_token);
    }
  }

  private removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private getUserFromLocalStorage(): User | null {
    try {
      const userString = localStorage.getItem('current_user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Erreur lors de la lecture du localStorage', error);
      return null;
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user && isPlatformBrowser(this.platformId)) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('current_user');
    }
  }
}
