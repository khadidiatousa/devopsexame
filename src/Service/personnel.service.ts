import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonnelService {
  private apiUrl = 'http://localhost:3000/personnel';

  constructor(private http: HttpClient) { }

  addPersonnel(personnelData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, personnelData);
  }

  getAllPersonnels(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // --- Add these methods as you implement them on your Laravel backend ---

  // Fetches a single personnel by ID
  getPersonnel(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Updates an existing personnel
  updatePersonnel(id: number, personnelData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, personnelData);
  }

  // Deletes a personnel
  deletePersonnel(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
