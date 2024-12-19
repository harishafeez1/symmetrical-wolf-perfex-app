import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
import { Sorting } from '../interfaces/sorting';
import { StorageService } from './storage.service';
export var STORAGE_SUBSCRIPTION_KEY = '-subscriptions';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionApiService {
  sort: Sorting = {
    sort_by: 'date_subscribed',
    order: 'desc'
  };

  sorts = [
    {
      key: 'id',
      name: 'id'
    },
    {
      key: 'name',
      name: 'subscription_name'
    },
    {
      key: 'company',
      name: 'client'
    },
    {
      key: 'project_name',
      name: 'project'
    },
    {
      key: 'status',
      name: 'subscription_status'
    },
    {
      key: 'next_billing_cycle',
      name: 'next_billing_cycle'
    },
    {
      key: 'date_subscribed',
      name: 'date_subscribed',
      default_order: 'desc'
    }
  ];

  constructor(
    public http: HttpClient,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService,
    private storageService: StorageService,
  ) {
    STORAGE_SUBSCRIPTION_KEY = this.authService.IDENTIFIER + STORAGE_SUBSCRIPTION_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/subscriptions/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}&sort=${JSON.stringify(this.sort)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/subscriptions/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        console.log('loaded api subscription: ', res);
        if (id == '' && search == '' && offset == 0 && res.status != false) {
          this.storageService.setObject(STORAGE_SUBSCRIPTION_KEY, res);
        }
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  get_plans(): Observable<any[]> {
    return this.http.get<any>(`/mpc_mobile_app_connector/v1/subscriptions/get_plans`).pipe(
      map(res => res),
      tap(res => {
        console.log('loaded api subscription plans: ', res);
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
      if(key == 'project_id' && formData.project_id != null && formData.project_id != '') {
        form_data.append('project_id', formData.project_id.id);
      }else{
        form_data.append(key, formData[key]);
      }
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/subscriptions', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('subscription inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(customer_id: any, formData: any) {

    if(formData.project_id !== null) {
      formData.project_id = formData.project_id.id;
    }
    return this.http.put<any>('/mpc_mobile_app_connector/v1/subscriptions/' + customer_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('subscription updated: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(subscription_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/subscriptions/' + subscription_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('subscription deleted: ', res);
        if (res.status) {
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }),
      catchError((err:any) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }
  cancelSubscription(id:any, type = ''): Observable<any[]> {
    const API_URL = `/mpc_mobile_app_connector/v1/subscriptions/cancel/${id}?type=${type}`;
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap((res: any) => {
        console.log('cancel subscription: ', res);
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
}
