import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryApiService {
  private  _languages: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private  _countries: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(public http: HttpClient) {
  }

  get(id = ''): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/countries`;
    if(id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/countries/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api countries: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }
  getCountriesData(): Observable<any> {
    return this._countries.asObservable();
  }
  setCountriesData(newData: any): void {
    this._countries.next(newData);
  }
  getLanguages(): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/common/languages`;
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api languages: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }
  getLanguageData(): Observable<any> {
    return this._languages.asObservable();
  }
  setLanguageData(newData: any): void {
    this._languages.next(newData);
  }
}
