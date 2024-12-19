import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommonApiService {

  constructor(public http: HttpClient) { }

  payment_mode(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/payment_mode`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api payment mode: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  get_relation_data(rel_type = '', rel_id = '', q  = ''): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/get_relation_data?type=${rel_type}&rel_id=${rel_id}&q=${q}`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api get relation data: ', res);
      }),
      catchError((err) => {
         return throwError(() => err);
      })
    ) as any;
  }

  tax_data(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/tax_data`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api tax data: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  expense_category(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/expense_category`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api expense_category: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  settings(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/settings`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  customers_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/customers_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  invoices_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/invoices_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  estimates_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/estimates_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  subscriptions_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/subscriptions_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  tasks_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/tasks_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  projects_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/projects_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  tickets_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/tickets_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }
  
  leads_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/leads_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }

  expenses_summary(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/common/expenses_summary`).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api settings: ', res);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    ) as any;
  }
}
