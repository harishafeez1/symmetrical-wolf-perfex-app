import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { MpcToastService } from './mpc-toast.service';
export var STORAGE_MILESTONE_KEY = '-milestones';

@Injectable({
  providedIn: 'root'
})
export class MilestoneApiService {
  constructor(
    public http: HttpClient,
    private mpcToast: MpcToastService,
    public authService: AuthenticationService
  ) {
    STORAGE_MILESTONE_KEY = this.authService.IDENTIFIER + STORAGE_MILESTONE_KEY;
  }

  get(id = '', search = '', offset = null, limit = null, applierFilters = {}): Observable<any[]> {
    let API_URL = `/mpc_mobile_app_connector/v1/milestones/search?search=${search}&limit=${limit}&offset=${offset}&filters=${JSON.stringify(applierFilters)}`;
    if (id != '') {
      API_URL = `/mpc_mobile_app_connector/v1/milestones/${id}`;
    }
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api milestone: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  getRelatedMilestoneData(search = '', rel_type = '', rel_id = ''): Observable<any[]> {
    const API_URL = `/mpc_mobile_app_connector/v1/milestones/search?search=${search}`;
    return this.http.get<any>(API_URL).pipe(
      map(res => res),
      tap(res => {
        // console.log('loaded api milestone: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  store(formData: any) {
    var form_data = new FormData();

    if ([0, false].includes(formData.description_visible_to_customer)) {
      delete formData.description_visible_to_customer;
    }

    for (var key in formData) {
      form_data.append(key, formData[key]);
    }

    return this.http.post<any>('/mpc_mobile_app_connector/v1/milestones', form_data).pipe(
      map(res => res),
      tap(res => {
        console.log('milestone inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  update(milestone_id: any, formData: any) {
    if ([0, false].includes(formData.description_visible_to_customer)) {
      delete formData.description_visible_to_customer;
    }

    return this.http.put<any>('/mpc_mobile_app_connector/v1/milestones/' + milestone_id, formData).pipe(
      map(res => res),
      tap(res => {
        console.log('milestone inserted: ', res);
      }),
      catchError((err) => {
        this.mpcToast.show(err, 'danger');
        return throwError(() => err);
      })
    ) as any;
  }

  delete(milestone_id) {
    return this.http.delete('/mpc_mobile_app_connector/v1/milestones/' + milestone_id).pipe(map(res => res),
      tap((res: any) => {
        console.log('milestone deleted: ', res);
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
