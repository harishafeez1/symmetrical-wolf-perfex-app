import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyApiService {
  private  _currencies: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(public http: HttpClient) { }

  get(id = ''): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/currencies`;
    if(id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/currencies/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api currencies: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }
  getCurrenciesData(): Observable<any> {
    return this._currencies.asObservable();
  }
  setCurrenciesData(newData: any): void {
    this._currencies.next(newData);
  }
}
