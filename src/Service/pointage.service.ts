// src/app/Service/pointage.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PointageService {

  private apiUrl = 'http://localhost:3000/pointage'; // <-- Votre URL API Laravel

  constructor(private http: HttpClient) { }

  getAllPointages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addPointage(pointage: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pointage);
  }

  getPointageByPersonnelIdAndDate(personnelId: string, date: string): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/by-personnel-date?personnel_id=${personnelId}&date=${date}`);
  }

  updatePointageDepart(personnel_id: string, date: string, heure_depart: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-depart-by-personnel`, { personnel_id, date, heure_depart });
  }

  deletePointage(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  getMonthlyWorkHours(personnelId: string, year: number, month: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/monthly-work-hours/${personnelId}`, {
      params: {
        year: year.toString(),
        month: month.toString()
      }
    });
  }
  downloadReport(format: 'pdf' | 'excel'): Observable<Blob> {

    const reportUrl = `http://localhost:8000/api/pointages/${format}`;

    return this.http.get(reportUrl, {
      responseType: 'blob'
    });
  }
}
