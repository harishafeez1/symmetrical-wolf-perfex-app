import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
import { StorageService } from './storage.service';
export var STORAGE_PAYMENT_KEY = '-payments';

@Injectable({
  providedIn: 'root'
})
export class PaymentApiService {
  sort: Sorting = {
    sort_by: 'id',
    order: 'desc'
  };

  sorts = [
    {
      key: 'id',
      name: 'payment',
      default_order: 'desc'
    },
    {
      key: 'invoiceid',
      name: 'invoice'
    },
    {
      key: 'paymentmode',
      name: 'payments_table_mode_heading'
    },
    {
      key: 'transactionid',
      name: 'payment_transaction_id'
    },
    {
      key: 'company',
      name: 'payments_table_client_heading'
    },
    {
      key: 'amount',
      name: 'payments_table_amount_heading'
    },
    {
      key: 'date',
      name: 'payments_table_date_heading'
    }
  ];

  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
  ) {
    STORAGE_PAYMENT_KEY = this.authService.IDENTIFIER + STORAGE_PAYMENT_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/payments/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/payments/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        console.log('loaded api payment: ', res);
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_PAYMENT_KEY, res);
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();
    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/payments', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('payment inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(payment_id: any, formData: any) {
    return this.http.put<any>('/mpc_mobile_app_connector/v1/payments/' + payment_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('payment updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(payment_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/payments/' + payment_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('payment deleted: ', res);
        if (res.status) {
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getPDF(id) {
    return this.http.get<any>('/mpc_mobile_app_connector/v1/payments/pdf/' + id + '?output_type=S').pipe(
      tap(res => {
        console.log('loaded api payment pdf: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

}
